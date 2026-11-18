import { RateConfig } from '../config/rates';
import {
  PrecisionMode,
  POISHA_PER_TAKA,
  bdtToPoisha,
  calcEffectivePercent,
  solveMaxAmountPoisha,
} from './money';

export type SendMoneyMode = 'send_exact' | 'from_balance';
export type SendMoneyProvider = 'bkash' | 'nagad_regular' | 'nagad_islamic';
export type BkashRecipientType = 'normal' | 'priyo';
export type NagadChannel = 'app' | 'ussd';

export type SendMoneyTier =
  | 'normal_small_free'
  | 'priyo_free'
  | 'tier1_5bdt'
  | 'tier2_10bdt'
  | 'flat_fee';

export type SendMoneyUnavailableReason =
  | 'zero_or_invalid'
  | 'insufficient_balance'
  | 'below_minimum'
  | 'above_maximum';

export interface SendMoneyResult {
  provider: SendMoneyProvider;
  available: boolean;
  unavailableReason?: SendMoneyUnavailableReason;
  feeType: 'tiered_flat' | 'flat';
  tier: SendMoneyTier;
  recipientReceivesPoisha: number;
  feePoisha: number;
  totalRequiredPoisha: number;
  remainingBalancePoisha: number;
  effectivePercent: number;
  crossedThreshold?: 'priyo_25k' | 'monthly_50k' | null;
  monthlyUsedPoisha?: number;
  priyoFreeRemainingPoisha?: number;
  minLimitPoisha?: number;
  maxLimitPoisha?: number;
}

function stepForPrecision(precision: PrecisionMode): number {
  return precision === 'whole' ? POISHA_PER_TAKA : 1;
}

/**
 * bKash-to-bKash Send Money Calculator (fixed-fee & monthly-tier rules).
 *
 * Never treats Send Money as a percentage cash-out fee.
 * Never deducts the fee from the recipient's stated amount in "send_exact" mode.
 */
export function calculateBkashSendMoney(params: {
  mode: SendMoneyMode;
  amountPoisha: number;
  recipientType: BkashRecipientType;
  monthlyUsedPoisha?: number;
  rates: RateConfig;
  precision: PrecisionMode;
}): SendMoneyResult {
  const { mode, amountPoisha, recipientType, monthlyUsedPoisha = 0, rates, precision } = params;

  const sm = rates.bkash.sendMoney;
  const safeUsed = Math.max(0, Math.floor(monthlyUsedPoisha || 0));
  const normalFreeMax = bdtToPoisha(sm.normalFreeMaxBdt);
  const priyoFreeLimit = bdtToPoisha(sm.priyoFreeMonthlyLimitBdt);
  const tier1Ceiling = bdtToPoisha(sm.tier1MonthlyCeilingBdt);
  const tier1Fee = bdtToPoisha(sm.tier1FeeBdt);
  const tier2Fee = bdtToPoisha(sm.tier2FeeBdt);
  const priyoFreeRemainingPoisha = Math.max(0, priyoFreeLimit - safeUsed);

  const evaluateTier = (
    sendPoisha: number
  ): { fee: number; tier: SendMoneyTier; crossed: SendMoneyResult['crossedThreshold'] } => {
    if (sendPoisha <= 0) {
      return { fee: 0, tier: recipientType === 'priyo' ? 'priyo_free' : 'normal_small_free', crossed: null };
    }

    const projected = safeUsed + sendPoisha;

    if (recipientType === 'priyo') {
      if (projected <= priyoFreeLimit) {
        return { fee: 0, tier: 'priyo_free', crossed: null };
      }
      if (projected <= tier1Ceiling) {
        return {
          fee: tier1Fee,
          tier: 'tier1_5bdt',
          crossed: safeUsed < priyoFreeLimit ? 'priyo_25k' : null,
        };
      }
      return {
        fee: tier2Fee,
        tier: 'tier2_10bdt',
        crossed: safeUsed <= tier1Ceiling ? 'monthly_50k' : null,
      };
    }

    // Normal (Non-Priyo) number
    if (sendPoisha <= normalFreeMax && safeUsed <= tier1Ceiling) {
      return { fee: 0, tier: 'normal_small_free', crossed: null };
    }
    if (projected <= tier1Ceiling) {
      return { fee: tier1Fee, tier: 'tier1_5bdt', crossed: null };
    }
    return {
      fee: tier2Fee,
      tier: 'tier2_10bdt',
      crossed: safeUsed <= tier1Ceiling ? 'monthly_50k' : null,
    };
  };

  if (!Number.isFinite(amountPoisha) || amountPoisha <= 0) {
    return {
      provider: 'bkash',
      available: false,
      unavailableReason: 'zero_or_invalid',
      feeType: 'tiered_flat',
      tier: recipientType === 'priyo' ? 'priyo_free' : 'tier1_5bdt',
      recipientReceivesPoisha: 0,
      feePoisha: 0,
      totalRequiredPoisha: 0,
      remainingBalancePoisha: 0,
      effectivePercent: 0,
      monthlyUsedPoisha: safeUsed,
      priyoFreeRemainingPoisha,
    };
  }

  if (mode === 'send_exact') {
    const { fee, tier, crossed } = evaluateTier(amountPoisha);
    const total = amountPoisha + fee;
    return {
      provider: 'bkash',
      available: true,
      feeType: 'tiered_flat',
      tier,
      recipientReceivesPoisha: amountPoisha,
      feePoisha: fee,
      totalRequiredPoisha: total,
      remainingBalancePoisha: 0,
      effectivePercent: calcEffectivePercent(amountPoisha, fee),
      crossedThreshold: crossed,
      monthlyUsedPoisha: safeUsed,
      priyoFreeRemainingPoisha,
    };
  }

  // Mode: from_balance
  const step = stepForPrecision(precision);
  const maxSend =
    solveMaxAmountPoisha({
      availableBalancePoisha: amountPoisha,
      stepPoisha: step,
      feeFn: (a) => evaluateTier(a).fee,
    }) ?? 0;

  if (maxSend <= 0) {
    return {
      provider: 'bkash',
      available: false,
      unavailableReason: 'insufficient_balance',
      feeType: 'tiered_flat',
      tier: 'tier1_5bdt',
      recipientReceivesPoisha: 0,
      feePoisha: 0,
      totalRequiredPoisha: 0,
      remainingBalancePoisha: amountPoisha,
      effectivePercent: 0,
      monthlyUsedPoisha: safeUsed,
      priyoFreeRemainingPoisha,
    };
  }

  const { fee, tier, crossed } = evaluateTier(maxSend);
  const total = maxSend + fee;
  return {
    provider: 'bkash',
    available: true,
    feeType: 'tiered_flat',
    tier,
    recipientReceivesPoisha: maxSend,
    feePoisha: fee,
    totalRequiredPoisha: total,
    remainingBalancePoisha: Math.max(0, amountPoisha - total),
    effectivePercent: calcEffectivePercent(maxSend, fee),
    crossedThreshold: crossed,
    monthlyUsedPoisha: safeUsed,
    priyoFreeRemainingPoisha,
  };
}

/**
 * Nagad Regular & Nagad Islamic Send Money Calculator (configurable flat fee).
 */
export function calculateNagadSendMoney(params: {
  accountType: 'regular' | 'islamic';
  channel: NagadChannel;
  mode: SendMoneyMode;
  amountPoisha: number;
  rates: RateConfig;
  precision: PrecisionMode;
}): SendMoneyResult {
  const { accountType, channel, mode, amountPoisha, rates, precision } = params;

  const provider: SendMoneyProvider = accountType === 'regular' ? 'nagad_regular' : 'nagad_islamic';
  const sm = rates.nagad.sendMoney;
  const flatFeeBdt =
    accountType === 'regular'
      ? channel === 'app'
        ? sm.regularAppFlatFeeBdt
        : sm.regularUssdFlatFeeBdt
      : channel === 'app'
        ? sm.islamicAppFlatFeeBdt
        : sm.islamicUssdFlatFeeBdt;

  const feePoisha = bdtToPoisha(flatFeeBdt);
  const minLimitPoisha = bdtToPoisha(sm.minBdt);
  const maxLimitPoisha = bdtToPoisha(sm.maxBdt);

  const baseMeta = {
    provider,
    feeType: 'flat' as const,
    tier: 'flat_fee' as const,
    minLimitPoisha,
    maxLimitPoisha,
  };

  if (!Number.isFinite(amountPoisha) || amountPoisha <= 0) {
    return {
      ...baseMeta,
      available: false,
      unavailableReason: 'zero_or_invalid',
      recipientReceivesPoisha: 0,
      feePoisha: 0,
      totalRequiredPoisha: 0,
      remainingBalancePoisha: 0,
      effectivePercent: 0,
    };
  }

  if (mode === 'send_exact') {
    if (amountPoisha < minLimitPoisha) {
      return {
        ...baseMeta,
        available: false,
        unavailableReason: 'below_minimum',
        recipientReceivesPoisha: 0,
        feePoisha: 0,
        totalRequiredPoisha: 0,
        remainingBalancePoisha: 0,
        effectivePercent: 0,
      };
    }
    if (amountPoisha > maxLimitPoisha) {
      return {
        ...baseMeta,
        available: false,
        unavailableReason: 'above_maximum',
        recipientReceivesPoisha: 0,
        feePoisha: 0,
        totalRequiredPoisha: 0,
        remainingBalancePoisha: 0,
        effectivePercent: 0,
      };
    }
    const total = amountPoisha + feePoisha;
    return {
      ...baseMeta,
      available: true,
      recipientReceivesPoisha: amountPoisha,
      feePoisha,
      totalRequiredPoisha: total,
      remainingBalancePoisha: 0,
      effectivePercent: calcEffectivePercent(amountPoisha, feePoisha),
    };
  }

  // Mode: from_balance
  const step = stepForPrecision(precision);
  const maxSend = solveMaxAmountPoisha({
    availableBalancePoisha: amountPoisha,
    stepPoisha: step,
    minPoisha: minLimitPoisha,
    maxPoisha: maxLimitPoisha,
    feeFn: (a) => (a > 0 ? feePoisha : 0),
  });

  if (maxSend === null || maxSend <= 0) {
    return {
      ...baseMeta,
      available: false,
      unavailableReason: 'insufficient_balance',
      recipientReceivesPoisha: 0,
      feePoisha: 0,
      totalRequiredPoisha: 0,
      remainingBalancePoisha: amountPoisha,
      effectivePercent: 0,
    };
  }

  const total = maxSend + feePoisha;
  return {
    ...baseMeta,
    available: true,
    recipientReceivesPoisha: maxSend,
    feePoisha,
    totalRequiredPoisha: total,
    remainingBalancePoisha: Math.max(0, amountPoisha - total),
    effectivePercent: calcEffectivePercent(maxSend, feePoisha),
  };
}
