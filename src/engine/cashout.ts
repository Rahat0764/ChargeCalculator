import { RateConfig } from '../config/rates';
import {
  PrecisionMode,
  POISHA_PER_TAKA,
  bdtToPoisha,
  calcEffectivePercent,
  calcPerThousandFeePoisha,
  solveMaxAmountPoisha,
} from './money';

export type CalculationMode = 'available_balance' | 'desired_amount';
export type AtmSourceType = 'regular' | 'remittance';
export type NagadAccountType = 'regular' | 'islamic';

export type PriyoAllowanceStatus =
  | 'discounted'
  | 'allowance_exhausted'
  | 'crossing_allowance_normal_rate';

export type CashOutUnavailableReason =
  | 'zero_or_invalid'
  | 'insufficient_balance'
  | 'below_atm_minimum'
  | 'atm_insufficient_with_fee'
  | 'exceeds_atm_max'
  | 'invalid_atm_multiple'
  | 'no_eligible_remittance';

export interface CashOutResult {
  methodId:
    | 'bkash_normal'
    | 'bkash_priyo'
    | 'bkash_atm_regular'
    | 'bkash_atm_remittance'
    | 'nagad_regular_app'
    | 'nagad_regular_ussd'
    | 'nagad_islamic_app'
    | 'nagad_islamic_ussd';
  available: boolean;
  unavailableReason?: CashOutUnavailableReason;
  cashOutAmountPoisha: number;
  feePoisha: number;
  totalDeductionPoisha: number;
  remainingBalancePoisha: number;
  effectiveRatePerThousand: number;
  effectivePercent: number;
  affordable?: boolean;
  shortfallPoisha?: number;
  // Priyo Agent specifics
  priyoStatus?: PriyoAllowanceStatus;
  priyoMonthlyAllowancePoisha?: number;
  priyoMonthlyUsedPoisha?: number;
  priyoRemainingAllowancePoisha?: number;
  // ATM specifics
  atmMinPoisha?: number;
  atmMaxPoisha?: number;
  atmMultiplePoisha?: number;
  atmMinRequiredBalancePoisha?: number;
  cappedByAtmMax?: boolean;
}

function stepForPrecision(precision: PrecisionMode): number {
  return precision === 'whole' ? POISHA_PER_TAKA : 1;
}

function calculateStandardPerThousand(params: {
  methodId: CashOutResult['methodId'];
  mode: CalculationMode;
  amountPoisha: number;
  ratePerThousand: number;
  precision: PrecisionMode;
  optionalBalancePoisha?: number | null;
}): CashOutResult {
  const { methodId, mode, amountPoisha, ratePerThousand, precision, optionalBalancePoisha = null } =
    params;

  if (!Number.isFinite(amountPoisha) || amountPoisha <= 0) {
    return {
      methodId,
      available: false,
      unavailableReason: 'zero_or_invalid',
      cashOutAmountPoisha: 0,
      feePoisha: 0,
      totalDeductionPoisha: 0,
      remainingBalancePoisha: 0,
      effectiveRatePerThousand: ratePerThousand,
      effectivePercent: 0,
    };
  }

  const feeFn = (a: number) => calcPerThousandFeePoisha(a, ratePerThousand);

  if (mode === 'available_balance') {
    const step = stepForPrecision(precision);
    const maxAmount =
      solveMaxAmountPoisha({
        availableBalancePoisha: amountPoisha,
        stepPoisha: step,
        feeFn,
      }) ?? 0;

    if (maxAmount <= 0) {
      return {
        methodId,
        available: false,
        unavailableReason: 'insufficient_balance',
        cashOutAmountPoisha: 0,
        feePoisha: 0,
        totalDeductionPoisha: 0,
        remainingBalancePoisha: amountPoisha,
        effectiveRatePerThousand: ratePerThousand,
        effectivePercent: 0,
      };
    }

    const fee = feeFn(maxAmount);
    const total = maxAmount + fee;
    return {
      methodId,
      available: true,
      cashOutAmountPoisha: maxAmount,
      feePoisha: fee,
      totalDeductionPoisha: total,
      remainingBalancePoisha: Math.max(0, amountPoisha - total),
      effectiveRatePerThousand: ratePerThousand,
      effectivePercent: calcEffectivePercent(maxAmount, fee),
    };
  }

  // Desired Cash-Out mode
  const fee = feeFn(amountPoisha);
  const total = amountPoisha + fee;
  const hasBalanceCheck = optionalBalancePoisha !== null && Number.isFinite(optionalBalancePoisha);
  const affordable = hasBalanceCheck ? optionalBalancePoisha! >= total : undefined;
  const remainingBalancePoisha =
    hasBalanceCheck && affordable ? Math.max(0, optionalBalancePoisha! - total) : 0;
  const shortfallPoisha =
    hasBalanceCheck && !affordable ? Math.max(0, total - optionalBalancePoisha!) : 0;

  return {
    methodId,
    available: true,
    cashOutAmountPoisha: amountPoisha,
    feePoisha: fee,
    totalDeductionPoisha: total,
    remainingBalancePoisha,
    effectiveRatePerThousand: ratePerThousand,
    effectivePercent: calcEffectivePercent(amountPoisha, fee),
    affordable,
    shortfallPoisha,
  };
}

export function calculateBkashNormalAgent(params: {
  mode: CalculationMode;
  amountPoisha: number;
  rates: RateConfig;
  precision: PrecisionMode;
  optionalBalancePoisha?: number | null;
}): CashOutResult {
  return calculateStandardPerThousand({
    methodId: 'bkash_normal',
    mode: params.mode,
    amountPoisha: params.amountPoisha,
    ratePerThousand: params.rates.bkash.cashOut.normalAgentPerThousand,
    precision: params.precision,
    optionalBalancePoisha: params.optionalBalancePoisha,
  });
}

/**
 * bKash Priyo Agent Cash Out with monthly BDT 50,000 discounted allowance.
 *
 * Crossing policy:
 * If a single transaction exceeds the remaining monthly discounted allowance,
 * do NOT apply a blended rate — apply the Normal Agent rate to the entire
 * crossing transaction per bKash published policy.
 */
export function calculateBkashPriyoAgent(params: {
  mode: CalculationMode;
  amountPoisha: number;
  rates: RateConfig;
  precision: PrecisionMode;
  monthlyUsedPoisha?: number;
  optionalBalancePoisha?: number | null;
}): CashOutResult {
  const {
    mode,
    amountPoisha,
    rates,
    precision,
    monthlyUsedPoisha = 0,
    optionalBalancePoisha = null,
  } = params;

  const priyoRate = rates.bkash.cashOut.priyoAgentPerThousand;
  const normalRate = rates.bkash.cashOut.normalAgentPerThousand;
  const allowancePoisha = bdtToPoisha(rates.bkash.cashOut.priyoMonthlyAllowanceBdt);
  const safeUsedPoisha = Math.max(0, Math.floor(monthlyUsedPoisha || 0));
  const remainingAllowancePoisha = Math.max(0, allowancePoisha - safeUsedPoisha);

  if (!Number.isFinite(amountPoisha) || amountPoisha <= 0) {
    return {
      methodId: 'bkash_priyo',
      available: false,
      unavailableReason: 'zero_or_invalid',
      cashOutAmountPoisha: 0,
      feePoisha: 0,
      totalDeductionPoisha: 0,
      remainingBalancePoisha: 0,
      effectiveRatePerThousand: remainingAllowancePoisha > 0 ? priyoRate : normalRate,
      effectivePercent: 0,
      priyoStatus: remainingAllowancePoisha > 0 ? 'discounted' : 'allowance_exhausted',
      priyoMonthlyAllowancePoisha: allowancePoisha,
      priyoMonthlyUsedPoisha: safeUsedPoisha,
      priyoRemainingAllowancePoisha: remainingAllowancePoisha,
    };
  }

  const applicableRateFor = (cashOutPoisha: number): number => {
    if (remainingAllowancePoisha <= 0) return normalRate;
    if (cashOutPoisha > remainingAllowancePoisha) return normalRate;
    return priyoRate;
  };

  const feeFn = (cashOutPoisha: number): number =>
    calcPerThousandFeePoisha(cashOutPoisha, applicableRateFor(cashOutPoisha));

  const resolveStatus = (cashOutPoisha: number): PriyoAllowanceStatus => {
    if (remainingAllowancePoisha <= 0) return 'allowance_exhausted';
    if (cashOutPoisha > remainingAllowancePoisha) return 'crossing_allowance_normal_rate';
    return 'discounted';
  };

  if (mode === 'available_balance') {
    const step = stepForPrecision(precision);
    const maxAmount =
      solveMaxAmountPoisha({
        availableBalancePoisha: amountPoisha,
        stepPoisha: step,
        feeFn,
      }) ?? 0;

    if (maxAmount <= 0) {
      return {
        methodId: 'bkash_priyo',
        available: false,
        unavailableReason: 'insufficient_balance',
        cashOutAmountPoisha: 0,
        feePoisha: 0,
        totalDeductionPoisha: 0,
        remainingBalancePoisha: amountPoisha,
        effectiveRatePerThousand: remainingAllowancePoisha > 0 ? priyoRate : normalRate,
        effectivePercent: 0,
        priyoStatus: remainingAllowancePoisha > 0 ? 'discounted' : 'allowance_exhausted',
        priyoMonthlyAllowancePoisha: allowancePoisha,
        priyoMonthlyUsedPoisha: safeUsedPoisha,
        priyoRemainingAllowancePoisha: remainingAllowancePoisha,
      };
    }

    const fee = feeFn(maxAmount);
    const total = maxAmount + fee;
    const status = resolveStatus(maxAmount);
    const rateUsed = applicableRateFor(maxAmount);

    return {
      methodId: 'bkash_priyo',
      available: true,
      cashOutAmountPoisha: maxAmount,
      feePoisha: fee,
      totalDeductionPoisha: total,
      remainingBalancePoisha: Math.max(0, amountPoisha - total),
      effectiveRatePerThousand: rateUsed,
      effectivePercent: calcEffectivePercent(maxAmount, fee),
      priyoStatus: status,
      priyoMonthlyAllowancePoisha: allowancePoisha,
      priyoMonthlyUsedPoisha: safeUsedPoisha,
      priyoRemainingAllowancePoisha: remainingAllowancePoisha,
    };
  }

  // Desired Cash-Out mode
  const fee = feeFn(amountPoisha);
  const total = amountPoisha + fee;
  const status = resolveStatus(amountPoisha);
  const rateUsed = applicableRateFor(amountPoisha);
  const hasBalanceCheck = optionalBalancePoisha !== null && Number.isFinite(optionalBalancePoisha);
  const affordable = hasBalanceCheck ? optionalBalancePoisha! >= total : undefined;
  const remainingBalancePoisha =
    hasBalanceCheck && affordable ? Math.max(0, optionalBalancePoisha! - total) : 0;
  const shortfallPoisha =
    hasBalanceCheck && !affordable ? Math.max(0, total - optionalBalancePoisha!) : 0;

  return {
    methodId: 'bkash_priyo',
    available: true,
    cashOutAmountPoisha: amountPoisha,
    feePoisha: fee,
    totalDeductionPoisha: total,
    remainingBalancePoisha,
    effectiveRatePerThousand: rateUsed,
    effectivePercent: calcEffectivePercent(amountPoisha, fee),
    affordable,
    shortfallPoisha,
    priyoStatus: status,
    priyoMonthlyAllowancePoisha: allowancePoisha,
    priyoMonthlyUsedPoisha: safeUsedPoisha,
    priyoRemainingAllowancePoisha: remainingAllowancePoisha,
  };
}

/**
 * bKash ATM Cash Out (Regular BDT 14.90/1,000 or Eligible Remittance BDT 7.00/1,000).
 *
 * Strictly enforces:
 * - Minimum withdrawal (default BDT 3,000) + fee coverage
 * - Required denomination multiple (default BDT 500)
 * - Per-transaction maximum (default BDT 20,000, configurable)
 * - Optional eligible remittance fund cap when sourceType === 'remittance'
 */
export function calculateBkashAtm(params: {
  mode: CalculationMode;
  amountPoisha: number;
  rates: RateConfig;
  sourceType: AtmSourceType;
  eligibleRemittanceBalancePoisha?: number | null;
  optionalBalancePoisha?: number | null;
}): CashOutResult {
  const {
    mode,
    amountPoisha,
    rates,
    sourceType,
    eligibleRemittanceBalancePoisha = null,
    optionalBalancePoisha = null,
  } = params;

  const isRemittance = sourceType === 'remittance';
  const methodId = isRemittance ? 'bkash_atm_remittance' : 'bkash_atm_regular';
  const rate = isRemittance
    ? rates.bkash.cashOut.remittanceAtmPerThousand
    : rates.bkash.cashOut.regularAtmPerThousand;

  const atmMinPoisha = bdtToPoisha(rates.bkash.cashOut.atmMinBdt);
  const atmMaxPoisha = bdtToPoisha(rates.bkash.cashOut.atmMaxPerTxnBdt);
  const atmMultiplePoisha = Math.max(POISHA_PER_TAKA, bdtToPoisha(rates.bkash.cashOut.atmMultipleBdt));

  const feeFn = (a: number) => calcPerThousandFeePoisha(a, rate);
  const minFee = feeFn(atmMinPoisha);
  const atmMinRequiredBalancePoisha = atmMinPoisha + minFee;

  const baseMeta = {
    methodId,
    effectiveRatePerThousand: rate,
    atmMinPoisha,
    atmMaxPoisha,
    atmMultiplePoisha,
    atmMinRequiredBalancePoisha,
  } as const;

  if (!Number.isFinite(amountPoisha) || amountPoisha <= 0) {
    return {
      ...baseMeta,
      available: false,
      unavailableReason: 'zero_or_invalid',
      cashOutAmountPoisha: 0,
      feePoisha: 0,
      totalDeductionPoisha: 0,
      remainingBalancePoisha: 0,
      effectivePercent: 0,
    };
  }

  if (mode === 'available_balance') {
    let effectiveBalance = amountPoisha;
    if (isRemittance && eligibleRemittanceBalancePoisha !== null) {
      if (eligibleRemittanceBalancePoisha <= 0) {
        return {
          ...baseMeta,
          available: false,
          unavailableReason: 'no_eligible_remittance',
          cashOutAmountPoisha: 0,
          feePoisha: 0,
          totalDeductionPoisha: 0,
          remainingBalancePoisha: amountPoisha,
          effectivePercent: 0,
        };
      }
      effectiveBalance = Math.min(amountPoisha, eligibleRemittanceBalancePoisha);
    }

    if (effectiveBalance < atmMinPoisha) {
      return {
        ...baseMeta,
        available: false,
        unavailableReason: 'below_atm_minimum',
        cashOutAmountPoisha: 0,
        feePoisha: 0,
        totalDeductionPoisha: 0,
        remainingBalancePoisha: amountPoisha,
        effectivePercent: 0,
        shortfallPoisha: atmMinRequiredBalancePoisha - effectiveBalance,
      };
    }

    if (effectiveBalance < atmMinRequiredBalancePoisha) {
      return {
        ...baseMeta,
        available: false,
        unavailableReason: 'atm_insufficient_with_fee',
        cashOutAmountPoisha: 0,
        feePoisha: 0,
        totalDeductionPoisha: 0,
        remainingBalancePoisha: amountPoisha,
        effectivePercent: 0,
        shortfallPoisha: atmMinRequiredBalancePoisha - effectiveBalance,
      };
    }

    const maxAmount = solveMaxAmountPoisha({
      availableBalancePoisha: effectiveBalance,
      stepPoisha: atmMultiplePoisha,
      minPoisha: atmMinPoisha,
      maxPoisha: atmMaxPoisha,
      feeFn,
    });

    if (maxAmount === null || maxAmount < atmMinPoisha) {
      return {
        ...baseMeta,
        available: false,
        unavailableReason: 'atm_insufficient_with_fee',
        cashOutAmountPoisha: 0,
        feePoisha: 0,
        totalDeductionPoisha: 0,
        remainingBalancePoisha: amountPoisha,
        effectivePercent: 0,
        shortfallPoisha: Math.max(0, atmMinRequiredBalancePoisha - effectiveBalance),
      };
    }

    const fee = feeFn(maxAmount);
    const total = maxAmount + fee;
    const nextStep = maxAmount + atmMultiplePoisha;
    const cappedByAtmMax =
      maxAmount === atmMaxPoisha && nextStep + feeFn(nextStep) <= effectiveBalance;

    return {
      ...baseMeta,
      available: true,
      cashOutAmountPoisha: maxAmount,
      feePoisha: fee,
      totalDeductionPoisha: total,
      remainingBalancePoisha: Math.max(0, amountPoisha - total),
      effectivePercent: calcEffectivePercent(maxAmount, fee),
      cappedByAtmMax,
    };
  }

  // Desired Cash-Out mode
  if (amountPoisha < atmMinPoisha) {
    return {
      ...baseMeta,
      available: false,
      unavailableReason: 'below_atm_minimum',
      cashOutAmountPoisha: 0,
      feePoisha: 0,
      totalDeductionPoisha: 0,
      remainingBalancePoisha: 0,
      effectivePercent: 0,
    };
  }

  if (amountPoisha > atmMaxPoisha) {
    return {
      ...baseMeta,
      available: false,
      unavailableReason: 'exceeds_atm_max',
      cashOutAmountPoisha: 0,
      feePoisha: 0,
      totalDeductionPoisha: 0,
      remainingBalancePoisha: 0,
      effectivePercent: 0,
    };
  }

  if (amountPoisha % atmMultiplePoisha !== 0) {
    return {
      ...baseMeta,
      available: false,
      unavailableReason: 'invalid_atm_multiple',
      cashOutAmountPoisha: 0,
      feePoisha: 0,
      totalDeductionPoisha: 0,
      remainingBalancePoisha: 0,
      effectivePercent: 0,
    };
  }

  const fee = feeFn(amountPoisha);
  const total = amountPoisha + fee;

  let checkBalance: number | null = optionalBalancePoisha;
  if (isRemittance && eligibleRemittanceBalancePoisha !== null) {
    if (eligibleRemittanceBalancePoisha <= 0) {
      return {
        ...baseMeta,
        available: false,
        unavailableReason: 'no_eligible_remittance',
        cashOutAmountPoisha: 0,
        feePoisha: 0,
        totalDeductionPoisha: 0,
        remainingBalancePoisha: 0,
        effectivePercent: 0,
      };
    }
    checkBalance =
      checkBalance !== null
        ? Math.min(checkBalance, eligibleRemittanceBalancePoisha)
        : eligibleRemittanceBalancePoisha;
  }

  const hasBalanceCheck = checkBalance !== null && Number.isFinite(checkBalance);
  const affordable = hasBalanceCheck ? checkBalance! >= total : undefined;
  const remainingBalancePoisha =
    hasBalanceCheck && affordable ? Math.max(0, checkBalance! - total) : 0;
  const shortfallPoisha =
    hasBalanceCheck && !affordable ? Math.max(0, total - checkBalance!) : 0;

  return {
    ...baseMeta,
    available: true,
    cashOutAmountPoisha: amountPoisha,
    feePoisha: fee,
    totalDeductionPoisha: total,
    remainingBalancePoisha,
    effectivePercent: calcEffectivePercent(amountPoisha, fee),
    affordable,
    shortfallPoisha,
  };
}

export function calculateNagadCashOut(params: {
  accountType: NagadAccountType;
  mode: CalculationMode;
  amountPoisha: number;
  rates: RateConfig;
  precision: PrecisionMode;
  optionalBalancePoisha?: number | null;
}): { app: CashOutResult; ussd: CashOutResult } {
  const { accountType, mode, amountPoisha, rates, precision, optionalBalancePoisha } = params;

  if (accountType === 'regular') {
    return {
      app: calculateStandardPerThousand({
        methodId: 'nagad_regular_app',
        mode,
        amountPoisha,
        ratePerThousand: rates.nagad.cashOut.regularAppPerThousand,
        precision,
        optionalBalancePoisha,
      }),
      ussd: calculateStandardPerThousand({
        methodId: 'nagad_regular_ussd',
        mode,
        amountPoisha,
        ratePerThousand: rates.nagad.cashOut.regularUssdPerThousand,
        precision,
        optionalBalancePoisha,
      }),
    };
  }

  return {
    app: calculateStandardPerThousand({
      methodId: 'nagad_islamic_app',
      mode,
      amountPoisha,
      ratePerThousand: rates.nagad.cashOut.islamicAppPerThousand,
      precision,
      optionalBalancePoisha,
    }),
    ussd: calculateStandardPerThousand({
      methodId: 'nagad_islamic_ussd',
      mode,
      amountPoisha,
      ratePerThousand: rates.nagad.cashOut.islamicUssdPerThousand,
      precision,
      optionalBalancePoisha,
    }),
  };
}
