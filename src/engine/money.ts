/**
 * Integer poisha monetary arithmetic utilities.
 *
 * 1 BDT = 100 poisha (exact integer representation).
 * BigInt is used internally for multiplication/division so even very large
 * amounts (hundreds of millions of BDT) never lose precision or overflow.
 *
 * Documented Rounding Policy:
 * - Fee calculations use CEILING to the nearest poisha (0.01 BDT) so fees are
 *   NEVER understated to make an unaffordable transaction appear possible.
 * - Exact fractions (e.g., 1,000 * 18.50 / 1,000 = 18.50) remain exact with
 *   zero artificial inflation.
 * - Whole Taka mode maximizes amounts in BDT 1 (100 poisha) increments,
 *   always rounding DOWN so amount + fee <= availableBalance.
 * - Precise mode maximizes amounts in 1 poisha (0.01 BDT) increments.
 */

export type PrecisionMode = 'whole' | 'precise';

export const POISHA_PER_TAKA = 100;
export const MAX_SAFE_BDT = 1_000_000_000; // 1 billion BDT cap to avoid runaway UI inputs

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

/**
 * Convert a Bengali/English numeric input string into integer poisha.
 * Returns null for blank or invalid values; clamps negative values to null.
 */
export function parseAmountToPoisha(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw) || raw < 0) return null;
    if (raw > MAX_SAFE_BDT) return Math.round(MAX_SAFE_BDT * POISHA_PER_TAKA);
    return Math.round(raw * POISHA_PER_TAKA);
  }

  // Convert Bengali digits to ASCII and strip commas/currency symbols/whitespace
  const normalized = raw
    .replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)))
    .replace(/[৳,\s]/g, '')
    .trim();

  if (normalized === '') return null;
  if (!/^\d+(\.\d*)?$/.test(normalized) && !/^\.\d+$/.test(normalized)) {
    return null;
  }

  const [wholePart = '0', fracPart = ''] = normalized.split('.');
  const wholeNum = Number(wholePart || '0');
  if (!Number.isFinite(wholeNum) || wholeNum < 0) return null;
  if (wholeNum > MAX_SAFE_BDT) return MAX_SAFE_BDT * POISHA_PER_TAKA;

  const paddedFrac = (fracPart + '00').slice(0, 2);
  const poisha = wholeNum * POISHA_PER_TAKA + Number(paddedFrac);
  if (!Number.isSafeInteger(poisha)) return MAX_SAFE_BDT * POISHA_PER_TAKA;
  return poisha;
}

/**
 * Convert a decimal BDT value (e.g., rate 13.95 or amount 510) to integer poisha.
 */
export function bdtToPoisha(bdt: number): number {
  if (!Number.isFinite(bdt) || bdt <= 0) return 0;
  const clamped = Math.min(bdt, MAX_SAFE_BDT);
  return Math.round(clamped * POISHA_PER_TAKA);
}

/**
 * Convert integer poisha back to decimal BDT number (for display/tests).
 */
export function poishaToBdt(poisha: number): number {
  if (!Number.isFinite(poisha)) return 0;
  return poisha / POISHA_PER_TAKA;
}

/**
 * Calculate per-thousand fee in integer poisha using exact BigInt ceiling division.
 *
 * Formula:
 *   feeBDT = amountBDT * ratePerThousand / 1000
 *   feePoisha = ceil(amountPoisha * ratePoishaPerThousand / 100_000)
 *
 * Guarantees fees are never understated while preserving exact results.
 */
export function calcPerThousandFeePoisha(amountPoisha: number, ratePerThousandBdt: number): number {
  if (!Number.isFinite(amountPoisha) || amountPoisha <= 0) return 0;
  if (!Number.isFinite(ratePerThousandBdt) || ratePerThousandBdt <= 0) return 0;

  const amountBig = BigInt(Math.floor(amountPoisha));
  // Support up to 4 decimal places in custom rates (10000x scaling -> divide by 10_000_000)
  const rateScaled = BigInt(Math.round(ratePerThousandBdt * 10_000));
  const denominator = 10_000_000n; // 1000 BDT * 10_000 scale
  const numerator = amountBig * rateScaled;
  if (numerator <= 0n) return 0;
  const feeBig = (numerator + denominator - 1n) / denominator;
  return Number(feeBig);
}

/**
 * Effective fee percentage (e.g., 1.85 for 18.50/1000) safely computed.
 */
export function calcEffectivePercent(amountPoisha: number, feePoisha: number): number {
  if (amountPoisha <= 0 || feePoisha <= 0) return 0;
  return Number(((feePoisha / amountPoisha) * 100).toFixed(3));
}

/**
 * Integer binary search inverse solver.
 *
 * Finds the largest valid amount `a` such that:
 * - `a` is an exact multiple of `stepPoisha`
 * - `minPoisha <= a <= maxPoisha`
 * - `a + feeFn(a) <= availableBalancePoisha`
 *
 * Requires `a + feeFn(a)` to be monotonically non-decreasing in `a`
 * (true for all percentage, flat, tiered, and threshold-crossing fees).
 *
 * Returns `0` (or `null` when `minPoisha > 0` and minimum is unaffordable).
 */
export function solveMaxAmountPoisha(options: {
  availableBalancePoisha: number;
  stepPoisha: number;
  minPoisha?: number;
  maxPoisha?: number | null;
  feeFn: (amountPoisha: number) => number;
}): number | null {
  const {
    availableBalancePoisha,
    stepPoisha,
    minPoisha = 0,
    maxPoisha = null,
    feeFn,
  } = options;

  if (!Number.isFinite(availableBalancePoisha) || availableBalancePoisha <= 0) {
    return minPoisha > 0 ? null : 0;
  }

  const step = Math.max(1, Math.floor(stepPoisha));
  const minK = minPoisha > 0 ? Math.ceil(minPoisha / step) : 0;
  const rawMaxAmount =
    maxPoisha !== null && Number.isFinite(maxPoisha)
      ? Math.min(availableBalancePoisha, Math.floor(maxPoisha))
      : Math.floor(availableBalancePoisha);
  const maxK = Math.floor(rawMaxAmount / step);

  if (maxK < minK) {
    return minPoisha > 0 ? null : 0;
  }

  // Check if even minimum step is affordable
  const minAmount = minK * step;
  if (minAmount > 0 && minAmount + feeFn(minAmount) > availableBalancePoisha) {
    return null;
  }

  let lo = minK;
  let hi = maxK;
  let best = minK;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const candidate = mid * step;
    const total = candidate + feeFn(candidate);
    if (total <= availableBalancePoisha) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  const result = best * step;
  if (minPoisha > 0 && result < minPoisha) return null;
  return result;
}

/**
 * Format integer poisha as BDT string using Bangladeshi grouping (e.g., 1,25,000.00).
 */
export function formatBdtFromPoisha(
  poisha: number,
  options?: {
    locale?: 'bn' | 'en';
    showDecimals?: boolean;
    includeSymbol?: boolean;
  }
): string {
  const { locale = 'bn', showDecimals = true, includeSymbol = true } = options ?? {};
  const safe = Number.isFinite(poisha) ? Math.max(0, Math.round(poisha)) : 0;
  const whole = Math.floor(safe / POISHA_PER_TAKA);
  const frac = safe % POISHA_PER_TAKA;

  const groupedWhole = formatBangladeshiGrouping(whole);
  let numStr = showDecimals || frac > 0 ? `${groupedWhole}.${String(frac).padStart(2, '0')}` : groupedWhole;

  if (locale === 'bn') {
    numStr = toBengaliDigits(numStr);
  }

  if (!includeSymbol) return numStr;
  return locale === 'bn' ? `৳${numStr}` : `BDT ${numStr}`;
}

export function formatBangladeshiGrouping(num: number): string {
  const s = String(Math.floor(Math.abs(num)));
  if (s.length <= 3) return s;
  const lastThree = s.slice(-3);
  const rest = s.slice(0, -3);
  const groupedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${groupedRest},${lastThree}`;
}

export function toBengaliDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

export function formatRate(rate: number, locale: 'bn' | 'en'): string {
  const s = rate.toFixed(2);
  return locale === 'bn' ? toBengaliDigits(s) : s;
}
