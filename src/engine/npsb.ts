import { RateConfig } from '../config/rates';
import {
  PrecisionMode,
  POISHA_PER_TAKA,
  bdtToPoisha,
  calcEffectivePercent,
  calcPerThousandFeePoisha,
  solveMaxAmountPoisha,
} from './money';

export type TransferChannel = 'npsb' | 'direct_bkash_to_bank';
export type DirectBankRatePreset = 'partner_10' | 'standard_12_5';
export type TransferMode = 'transfer_amount' | 'from_balance';
export type TransferSource = 'bkash' | 'nagad';
export type TransferDestination = 'bank' | 'bkash' | 'nagad' | 'rocket';
export type RouteAvailabilityStatus = 'verified' | 'confirm_in_app';

export type TransferUnavailableReason =
  | 'zero_or_invalid'
  | 'same_provider'
  | 'below_minimum'
  | 'above_maximum'
  | 'insufficient_for_minimum';

export interface RouteInfo {
  source: TransferSource;
  destination: TransferDestination;
  availability: RouteAvailabilityStatus;
  minPoisha: number | null;
  maxPoisha: number | null;
}

export interface TransferResult {
  channel: TransferChannel;
  source: TransferSource;
  destination: TransferDestination;
  routeAvailability: RouteAvailabilityStatus;
  available: boolean;
  unavailableReason?: TransferUnavailableReason;
  transferAmountPoisha: number;
  feePoisha: number;
  totalDeductionPoisha: number;
  recipientReceivesPoisha: number;
  remainingBalancePoisha: number;
  ratePerThousand: number;
  effectivePercent: number;
  minLimitPoisha: number | null;
  maxLimitPoisha: number | null;
  minRequiredBalancePoisha: number | null;
  cappedByMaxLimit?: boolean;
}

export function getNpsbDestinationsForSource(source: TransferSource): TransferDestination[] {
  if (source === 'bkash') {
    return ['bank', 'nagad', 'rocket'];
  }
  return ['bank', 'bkash', 'rocket'];
}

export function getRouteInfo(
  channel: TransferChannel,
  source: TransferSource,
  destination: TransferDestination,
  rates: RateConfig
): RouteInfo {
  if (channel === 'direct_bkash_to_bank') {
    return {
      source: 'bkash',
      destination: 'bank',
      availability: 'verified',
      minPoisha: bdtToPoisha(rates.bkash.directBank.minBdt),
      maxPoisha: bdtToPoisha(rates.bkash.directBank.maxBdt),
    };
  }

  if (source === 'bkash') {
    return {
      source,
      destination,
      availability: 'verified',
      minPoisha: bdtToPoisha(rates.npsb.bkashMinBdt),
      maxPoisha: bdtToPoisha(rates.npsb.bkashMaxBdt),
    };
  }

  // Nagad NPSB routes: do NOT invent unverified min/max limits unless user explicitly configures them
  return {
    source,
    destination,
    availability: 'confirm_in_app',
    minPoisha:
      rates.npsb.otherProviderMinBdt !== null ? bdtToPoisha(rates.npsb.otherProviderMinBdt) : null,
    maxPoisha:
      rates.npsb.otherProviderMaxBdt !== null ? bdtToPoisha(rates.npsb.otherProviderMaxBdt) : null,
  };
}

export function calculateNpsbOrBankTransfer(params: {
  channel: TransferChannel;
  source: TransferSource;
  destination: TransferDestination;
  mode: TransferMode;
  amountPoisha: number;
  rates: RateConfig;
  precision: PrecisionMode;
  directBankPreset?: DirectBankRatePreset;
}): TransferResult {
  const {
    channel,
    source,
    destination,
    mode,
    amountPoisha,
    rates,
    precision,
    directBankPreset = 'standard_12_5',
  } = params;

  const effectiveSource: TransferSource = channel === 'direct_bkash_to_bank' ? 'bkash' : source;
  const effectiveDestination: TransferDestination =
    channel === 'direct_bkash_to_bank' ? 'bank' : destination;

  const route = getRouteInfo(channel, effectiveSource, effectiveDestination, rates);

  const ratePerThousand =
    channel === 'npsb'
      ? rates.npsb.mfsToBankOrMfsPerThousand
      : directBankPreset === 'partner_10'
        ? rates.bkash.directBank.partnerPerThousand
        : rates.bkash.directBank.standardPerThousand;

  const feeFn = (a: number) => calcPerThousandFeePoisha(a, ratePerThousand);
  const minRequiredBalancePoisha =
    route.minPoisha !== null && route.minPoisha > 0
      ? route.minPoisha + feeFn(route.minPoisha)
      : null;

  const baseMeta = {
    channel,
    source: effectiveSource,
    destination: effectiveDestination,
    routeAvailability: route.availability,
    ratePerThousand,
    minLimitPoisha: route.minPoisha,
    maxLimitPoisha: route.maxPoisha,
    minRequiredBalancePoisha,
  };

  if (effectiveSource === effectiveDestination) {
    return {
      ...baseMeta,
      available: false,
      unavailableReason: 'same_provider',
      transferAmountPoisha: 0,
      feePoisha: 0,
      totalDeductionPoisha: 0,
      recipientReceivesPoisha: 0,
      remainingBalancePoisha: 0,
      effectivePercent: 0,
    };
  }

  if (!Number.isFinite(amountPoisha) || amountPoisha <= 0) {
    return {
      ...baseMeta,
      available: false,
      unavailableReason: 'zero_or_invalid',
      transferAmountPoisha: 0,
      feePoisha: 0,
      totalDeductionPoisha: 0,
      recipientReceivesPoisha: 0,
      remainingBalancePoisha: 0,
      effectivePercent: 0,
    };
  }

  if (mode === 'transfer_amount') {
    if (route.minPoisha !== null && amountPoisha < route.minPoisha) {
      return {
        ...baseMeta,
        available: false,
        unavailableReason: 'below_minimum',
        transferAmountPoisha: 0,
        feePoisha: 0,
        totalDeductionPoisha: 0,
        recipientReceivesPoisha: 0,
        remainingBalancePoisha: 0,
        effectivePercent: 0,
      };
    }
    if (route.maxPoisha !== null && amountPoisha > route.maxPoisha) {
      return {
        ...baseMeta,
        available: false,
        unavailableReason: 'above_maximum',
        transferAmountPoisha: 0,
        feePoisha: 0,
        totalDeductionPoisha: 0,
        recipientReceivesPoisha: 0,
        remainingBalancePoisha: 0,
        effectivePercent: 0,
      };
    }

    const fee = feeFn(amountPoisha);
    const total = amountPoisha + fee;
    return {
      ...baseMeta,
      available: true,
      transferAmountPoisha: amountPoisha,
      feePoisha: fee,
      totalDeductionPoisha: total,
      recipientReceivesPoisha: amountPoisha,
      remainingBalancePoisha: 0,
      effectivePercent: calcEffectivePercent(amountPoisha, fee),
    };
  }

  // Mode: from_balance
  const step = precision === 'whole' ? POISHA_PER_TAKA : 1;
  const maxTransfer = solveMaxAmountPoisha({
    availableBalancePoisha: amountPoisha,
    stepPoisha: step,
    minPoisha: route.minPoisha ?? 0,
    maxPoisha: route.maxPoisha,
    feeFn,
  });

  if (maxTransfer === null || maxTransfer <= 0) {
    return {
      ...baseMeta,
      available: false,
      unavailableReason: 'insufficient_for_minimum',
      transferAmountPoisha: 0,
      feePoisha: 0,
      totalDeductionPoisha: 0,
      recipientReceivesPoisha: 0,
      remainingBalancePoisha: amountPoisha,
      effectivePercent: 0,
    };
  }

  const fee = feeFn(maxTransfer);
  const total = maxTransfer + fee;
  const cappedByMaxLimit =
    route.maxPoisha !== null &&
    maxTransfer === route.maxPoisha &&
    route.maxPoisha + step + feeFn(route.maxPoisha + step) <= amountPoisha;

  return {
    ...baseMeta,
    available: true,
    transferAmountPoisha: maxTransfer,
    feePoisha: fee,
    totalDeductionPoisha: total,
    recipientReceivesPoisha: maxTransfer,
    remainingBalancePoisha: Math.max(0, amountPoisha - total),
    effectivePercent: calcEffectivePercent(maxTransfer, fee),
    cappedByMaxLimit,
  };
}
