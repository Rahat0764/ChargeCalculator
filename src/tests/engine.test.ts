import { describe, it, expect } from 'vitest';
import { DEFAULT_RATES, cloneRates } from '../config/rates';
import {
  bdtToPoisha,
  calcPerThousandFeePoisha,
  calculateBkashAtm,
  calculateBkashNormalAgent,
  calculateBkashPriyoAgent,
  calculateBkashSendMoney,
  calculateNagadCashOut,
  calculateNagadSendMoney,
  calculateNpsbOrBankTransfer,
  parseAmountToPoisha,
  poishaToBdt,
} from '../engine';

describe('ChargeCalculator Financial Engine — All 25 Required Scenarios + Invariants', () => {
  // 1. bKash balance BDT 510 with normal agent
  it('1. calculates bKash balance BDT 510 with Normal Agent (18.50/1,000)', () => {
    const whole = calculateBkashNormalAgent({
      mode: 'available_balance',
      amountPoisha: bdtToPoisha(510),
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    // 500 + ceil(500 * 18.50 / 1000) = 500 + 9.25 = 509.25 <= 510
    // 501 + ceil(501 * 18.50 / 1000) = 501 + 9.27 = 510.27 > 510
    expect(whole.available).toBe(true);
    expect(poishaToBdt(whole.cashOutAmountPoisha)).toBe(500);
    expect(poishaToBdt(whole.feePoisha)).toBe(9.25);
    expect(poishaToBdt(whole.totalDeductionPoisha)).toBe(509.25);
    expect(poishaToBdt(whole.remainingBalancePoisha)).toBe(0.75);

    const precise = calculateBkashNormalAgent({
      mode: 'available_balance',
      amountPoisha: bdtToPoisha(510),
      rates: DEFAULT_RATES,
      precision: 'precise',
    });
    expect(precise.available).toBe(true);
    expect(precise.totalDeductionPoisha).toBeLessThanOrEqual(bdtToPoisha(510));
    expect(precise.cashOutAmountPoisha).toBeGreaterThan(bdtToPoisha(500));
  });

  // 2. bKash balance BDT 510 with Priyo Agent
  it('2. calculates bKash balance BDT 510 with Priyo Agent (13.95/1,000)', () => {
    const res = calculateBkashPriyoAgent({
      mode: 'available_balance',
      amountPoisha: bdtToPoisha(510),
      rates: DEFAULT_RATES,
      precision: 'whole',
      monthlyUsedPoisha: 0,
    });
    // 502 + ceil(502 * 13.95 / 1000) = 502 + 7.01 = 509.01 <= 510
    // 503 + ceil(503 * 13.95 / 1000) = 503 + 7.02 = 510.02 > 510
    expect(res.available).toBe(true);
    expect(res.priyoStatus).toBe('discounted');
    expect(poishaToBdt(res.cashOutAmountPoisha)).toBe(502);
    expect(poishaToBdt(res.feePoisha)).toBe(7.01);
    expect(poishaToBdt(res.totalDeductionPoisha)).toBe(509.01);
    expect(poishaToBdt(res.remainingBalancePoisha)).toBe(0.99);
  });

  // 3. bKash balance BDT 510 with ATM unavailable
  it('3. marks bKash ATM unavailable for balance BDT 510', () => {
    const res = calculateBkashAtm({
      mode: 'available_balance',
      amountPoisha: bdtToPoisha(510),
      rates: DEFAULT_RATES,
      sourceType: 'regular',
    });
    expect(res.available).toBe(false);
    expect(res.unavailableReason).toBe('below_atm_minimum');
    expect(res.cashOutAmountPoisha).toBe(0);
  });

  // 4. bKash balance BDT 3,000 with ATM fee-inclusive minimum
  it('4. rejects bKash ATM at exact BDT 3,000 balance because fee is not covered', () => {
    const res = calculateBkashAtm({
      mode: 'available_balance',
      amountPoisha: bdtToPoisha(3000),
      rates: DEFAULT_RATES,
      sourceType: 'regular',
    });
    expect(res.available).toBe(false);
    expect(res.unavailableReason).toBe('atm_insufficient_with_fee');
    // 3,000 + 44.70 = 3,044.70 required
    expect(poishaToBdt(res.atmMinRequiredBalancePoisha!)).toBe(3044.7);
  });

  // 5. bKash balance sufficient for BDT 3,000 ATM withdrawal plus fee
  it('5. allows bKash ATM withdrawal when balance covers BDT 3,000 + BDT 44.70 fee', () => {
    const exact = calculateBkashAtm({
      mode: 'available_balance',
      amountPoisha: bdtToPoisha(3044.7),
      rates: DEFAULT_RATES,
      sourceType: 'regular',
    });
    expect(exact.available).toBe(true);
    expect(poishaToBdt(exact.cashOutAmountPoisha)).toBe(3000);
    expect(poishaToBdt(exact.feePoisha)).toBe(44.7);
    expect(poishaToBdt(exact.totalDeductionPoisha)).toBe(3044.7);
    expect(exact.remainingBalancePoisha).toBe(0);
  });

  // 6. bKash remittance ATM with eligible funds
  it('6. calculates bKash Remittance ATM (7.00/1,000) bounded by eligible remittance funds', () => {
    const res = calculateBkashAtm({
      mode: 'available_balance',
      amountPoisha: bdtToPoisha(10000),
      rates: DEFAULT_RATES,
      sourceType: 'remittance',
      eligibleRemittanceBalancePoisha: bdtToPoisha(4000),
    });
    // Eligible remittance is 4000; 3500 + 24.50 = 3524.50 <= 4000; 4000 + 28 = 4028 > 4000
    expect(res.available).toBe(true);
    expect(poishaToBdt(res.cashOutAmountPoisha)).toBe(3500);
    expect(poishaToBdt(res.feePoisha)).toBe(24.5);
    expect(poishaToBdt(res.totalDeductionPoisha)).toBe(3524.5);
    expect(poishaToBdt(res.remainingBalancePoisha)).toBe(6475.5);
  });

  // 7. Priyo Agent monthly allowance fully available
  it('7. applies discounted 13.95/1,000 when Priyo Agent allowance is fully available', () => {
    const res = calculateBkashPriyoAgent({
      mode: 'desired_amount',
      amountPoisha: bdtToPoisha(10000),
      rates: DEFAULT_RATES,
      precision: 'whole',
      monthlyUsedPoisha: 0,
    });
    expect(res.priyoStatus).toBe('discounted');
    expect(poishaToBdt(res.feePoisha)).toBe(139.5);
    expect(poishaToBdt(res.totalDeductionPoisha)).toBe(10139.5);
  });

  // 8. Priyo Agent monthly allowance exhausted
  it('8. applies Normal Agent 18.50/1,000 when Priyo monthly allowance (50,000) is exhausted', () => {
    const res = calculateBkashPriyoAgent({
      mode: 'desired_amount',
      amountPoisha: bdtToPoisha(1000),
      rates: DEFAULT_RATES,
      precision: 'whole',
      monthlyUsedPoisha: bdtToPoisha(50000),
    });
    expect(res.priyoStatus).toBe('allowance_exhausted');
    expect(res.effectiveRatePerThousand).toBe(18.5);
    expect(poishaToBdt(res.feePoisha)).toBe(18.5);
  });

  // 9. Priyo Agent transaction crossing the remaining monthly allowance (NO blended fee!)
  it('9. applies Normal Agent rate to the ENTIRE crossing transaction (no blended fee)', () => {
    // 49,000 used -> 1,000 remaining discounted allowance; withdrawing 2,000 crosses it
    const res = calculateBkashPriyoAgent({
      mode: 'desired_amount',
      amountPoisha: bdtToPoisha(2000),
      rates: DEFAULT_RATES,
      precision: 'whole',
      monthlyUsedPoisha: bdtToPoisha(49000),
    });
    expect(res.priyoStatus).toBe('crossing_allowance_normal_rate');
    expect(res.effectiveRatePerThousand).toBe(18.5);
    // Entire 2,000 at 18.50/1000 = 37.00 (NOT blended 13.95 + 18.50 = 32.45)
    expect(poishaToBdt(res.feePoisha)).toBe(37);
    expect(poishaToBdt(res.totalDeductionPoisha)).toBe(2037);
  });

  // 10. Nagad Regular App calculation
  it('10. calculates Nagad Regular App (12.99/1,000) and USSD (15.00/1,000)', () => {
    const res = calculateNagadCashOut({
      accountType: 'regular',
      mode: 'desired_amount',
      amountPoisha: bdtToPoisha(1000),
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(poishaToBdt(res.app.feePoisha)).toBe(12.99);
    expect(poishaToBdt(res.app.totalDeductionPoisha)).toBe(1012.99);
    expect(poishaToBdt(res.ussd.feePoisha)).toBe(15);
    expect(poishaToBdt(res.ussd.totalDeductionPoisha)).toBe(1015);
  });

  // 11. Nagad Islamic calculation
  it('11. calculates Nagad Islamic cash-out (15.00/1,000)', () => {
    const res = calculateNagadCashOut({
      accountType: 'islamic',
      mode: 'available_balance',
      amountPoisha: bdtToPoisha(1015),
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(poishaToBdt(res.app.cashOutAmountPoisha)).toBe(1000);
    expect(poishaToBdt(res.app.feePoisha)).toBe(15);
    expect(res.app.remainingBalancePoisha).toBe(0);
  });

  // 12. bKash Send Money with flat charges (Normal number)
  it('12. calculates bKash Send Money flat charges for Normal Number (<=50 free, >50 BDT 5)', () => {
    const freeSmall = calculateBkashSendMoney({
      mode: 'send_exact',
      amountPoisha: bdtToPoisha(50),
      recipientType: 'normal',
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(freeSmall.feePoisha).toBe(0);
    expect(poishaToBdt(freeSmall.totalRequiredPoisha)).toBe(50);

    const exact500 = calculateBkashSendMoney({
      mode: 'send_exact',
      amountPoisha: bdtToPoisha(500),
      recipientType: 'normal',
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(poishaToBdt(exact500.recipientReceivesPoisha)).toBe(500);
    expect(poishaToBdt(exact500.feePoisha)).toBe(5);
    expect(poishaToBdt(exact500.totalRequiredPoisha)).toBe(505);

    const from510 = calculateBkashSendMoney({
      mode: 'from_balance',
      amountPoisha: bdtToPoisha(510),
      recipientType: 'normal',
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(poishaToBdt(from510.recipientReceivesPoisha)).toBe(505);
    expect(poishaToBdt(from510.feePoisha)).toBe(5);
    expect(from510.remainingBalancePoisha).toBe(0);
  });

  // 13. bKash Priyo Number free transfer
  it('13. calculates bKash Priyo Number free transfer up to BDT 25,000/month', () => {
    const res = calculateBkashSendMoney({
      mode: 'send_exact',
      amountPoisha: bdtToPoisha(10000),
      recipientType: 'priyo',
      monthlyUsedPoisha: bdtToPoisha(15000),
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(res.feePoisha).toBe(0);
    expect(res.tier).toBe('priyo_free');
    expect(poishaToBdt(res.totalRequiredPoisha)).toBe(10000);
  });

  // 14. bKash monthly-tier fee crossing (25k -> 5 BDT, 50k -> 10 BDT)
  it('14. handles bKash Send Money monthly-tier threshold crossings accurately', () => {
    const cross25k = calculateBkashSendMoney({
      mode: 'send_exact',
      amountPoisha: bdtToPoisha(1000),
      recipientType: 'priyo',
      monthlyUsedPoisha: bdtToPoisha(24500),
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(poishaToBdt(cross25k.feePoisha)).toBe(5);
    expect(cross25k.crossedThreshold).toBe('priyo_25k');

    const cross50k = calculateBkashSendMoney({
      mode: 'send_exact',
      amountPoisha: bdtToPoisha(2000),
      recipientType: 'normal',
      monthlyUsedPoisha: bdtToPoisha(49000),
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(poishaToBdt(cross50k.feePoisha)).toBe(10);
    expect(cross50k.crossedThreshold).toBe('monthly_50k');
  });

  // 15. Nagad Send Money flat charge
  it('15. calculates Nagad Regular & Islamic Send Money flat BDT 5 charge', () => {
    const send500 = calculateNagadSendMoney({
      accountType: 'regular',
      channel: 'app',
      mode: 'send_exact',
      amountPoisha: bdtToPoisha(500),
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(send500.feeType).toBe('flat');
    expect(poishaToBdt(send500.recipientReceivesPoisha)).toBe(500);
    expect(poishaToBdt(send500.feePoisha)).toBe(5);
    expect(poishaToBdt(send500.totalRequiredPoisha)).toBe(505);

    const islamicFrom510 = calculateNagadSendMoney({
      accountType: 'islamic',
      channel: 'app',
      mode: 'from_balance',
      amountPoisha: bdtToPoisha(510),
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(poishaToBdt(islamicFrom510.recipientReceivesPoisha)).toBe(505);
    expect(poishaToBdt(islamicFrom510.feePoisha)).toBe(5);
    expect(islamicFrom510.remainingBalancePoisha).toBe(0);
  });

  // 16. NPSB transfer from bKash (8.50/1,000 = 0.85%)
  it('16. calculates NPSB transfer from bKash at verified BDT 8.50/1,000 (0.85%)', () => {
    const res = calculateNpsbOrBankTransfer({
      channel: 'npsb',
      source: 'bkash',
      destination: 'bank',
      mode: 'transfer_amount',
      amountPoisha: bdtToPoisha(10000),
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(res.available).toBe(true);
    expect(res.routeAvailability).toBe('verified');
    expect(res.ratePerThousand).toBe(8.5);
    expect(poishaToBdt(res.feePoisha)).toBe(85);
    expect(poishaToBdt(res.totalDeductionPoisha)).toBe(10085);
  });

  // 17. NPSB transfer from Nagad (labels route appropriately without inventing limits)
  it('17. calculates NPSB transfer from Nagad and marks unverified limits transparently', () => {
    const res = calculateNpsbOrBankTransfer({
      channel: 'npsb',
      source: 'nagad',
      destination: 'bkash',
      mode: 'transfer_amount',
      amountPoisha: bdtToPoisha(2000),
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(res.available).toBe(true);
    expect(res.routeAvailability).toBe('confirm_in_app');
    expect(res.minLimitPoisha).toBeNull();
    expect(res.maxLimitPoisha).toBeNull();
    expect(poishaToBdt(res.feePoisha)).toBe(17);
    expect(poishaToBdt(res.totalDeductionPoisha)).toBe(2017);
  });

  // 18. NPSB minimum/maximum boundaries (bKash 300..25,000)
  it('18. enforces bKash NPSB minimum (BDT 300) and maximum (BDT 25,000) boundaries', () => {
    const belowMin = calculateNpsbOrBankTransfer({
      channel: 'npsb',
      source: 'bkash',
      destination: 'nagad',
      mode: 'transfer_amount',
      amountPoisha: bdtToPoisha(299),
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(belowMin.available).toBe(false);
    expect(belowMin.unavailableReason).toBe('below_minimum');

    const exactMin = calculateNpsbOrBankTransfer({
      channel: 'npsb',
      source: 'bkash',
      destination: 'nagad',
      mode: 'transfer_amount',
      amountPoisha: bdtToPoisha(300),
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(exactMin.available).toBe(true);
    expect(poishaToBdt(exactMin.feePoisha)).toBe(2.55);

    const aboveMax = calculateNpsbOrBankTransfer({
      channel: 'npsb',
      source: 'bkash',
      destination: 'rocket',
      mode: 'transfer_amount',
      amountPoisha: bdtToPoisha(25001),
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(aboveMax.available).toBe(false);
    expect(aboveMax.unavailableReason).toBe('above_maximum');

    // Direct bKash-to-Bank non-NPSB separate route (10.00 & 12.50)
    const direct10 = calculateNpsbOrBankTransfer({
      channel: 'direct_bkash_to_bank',
      source: 'bkash',
      destination: 'bank',
      mode: 'transfer_amount',
      amountPoisha: bdtToPoisha(10000),
      rates: DEFAULT_RATES,
      precision: 'whole',
      directBankPreset: 'partner_10',
    });
    expect(poishaToBdt(direct10.feePoisha)).toBe(100);

    const direct125 = calculateNpsbOrBankTransfer({
      channel: 'direct_bkash_to_bank',
      source: 'bkash',
      destination: 'bank',
      mode: 'transfer_amount',
      amountPoisha: bdtToPoisha(10000),
      rates: DEFAULT_RATES,
      precision: 'whole',
      directBankPreset: 'standard_12_5',
    });
    expect(poishaToBdt(direct125.feePoisha)).toBe(125);
  });

  // 19. Exact balance including fees
  it('19. handles exact fee-inclusive balances with zero leftover poisha', () => {
    // 1,000 + 18.50 = 1,018.50
    const res = calculateBkashNormalAgent({
      mode: 'available_balance',
      amountPoisha: bdtToPoisha(1018.5),
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(poishaToBdt(res.cashOutAmountPoisha)).toBe(1000);
    expect(poishaToBdt(res.feePoisha)).toBe(18.5);
    expect(res.remainingBalancePoisha).toBe(0);
  });

  // 20. Small fractions and rounding (never understate fees!)
  it('20. rounds small fractions up to the nearest poisha without understating fees', () => {
    // 1 BDT at 13.95/1000 = 0.01395 BDT -> 0.02 BDT (2 poisha, never understated to 0.01)
    expect(calcPerThousandFeePoisha(bdtToPoisha(1), 13.95)).toBe(2);
    // 1,000 BDT at 18.50/1000 = exactly 18.50 BDT (1850 poisha, no spurious +1)
    expect(calcPerThousandFeePoisha(bdtToPoisha(1000), 18.5)).toBe(1850);
    // 500 BDT at 13.95/1000 = 6.975 BDT -> 6.98 BDT (698 poisha)
    expect(calcPerThousandFeePoisha(bdtToPoisha(500), 13.95)).toBe(698);
  });

  // 21. Zero balance
  it('21. handles zero balance gracefully with zero NaN or negative values', () => {
    const res = calculateBkashNormalAgent({
      mode: 'available_balance',
      amountPoisha: 0,
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(res.available).toBe(false);
    expect(res.cashOutAmountPoisha).toBe(0);
    expect(res.feePoisha).toBe(0);
    expect(res.totalDeductionPoisha).toBe(0);
  });

  // 22. Invalid values
  it('22. rejects invalid strings, negative values, NaN, and Infinity safely', () => {
    expect(parseAmountToPoisha('')).toBeNull();
    expect(parseAmountToPoisha('   ')).toBeNull();
    expect(parseAmountToPoisha('abc')).toBeNull();
    expect(parseAmountToPoisha('-500')).toBeNull();
    expect(parseAmountToPoisha('12.34.56')).toBeNull();
    expect(parseAmountToPoisha(NaN)).toBeNull();
    expect(parseAmountToPoisha(Infinity)).toBeNull();
    // Bengali numerals supported cleanly!
    expect(parseAmountToPoisha('৳৫১০.৫০')).toBe(51050);
  });

  // 23. Very large amounts
  it('23. handles very large amounts accurately with BigInt integer arithmetic', () => {
    const res = calculateBkashNormalAgent({
      mode: 'desired_amount',
      amountPoisha: bdtToPoisha(100_000_000), // 10 Crore BDT
      rates: DEFAULT_RATES,
      precision: 'whole',
    });
    expect(poishaToBdt(res.feePoisha)).toBe(1_850_000);
    expect(poishaToBdt(res.totalDeductionPoisha)).toBe(101_850_000);
    expect(Number.isFinite(res.totalDeductionPoisha)).toBe(true);
  });

  // 24. Custom rate changes
  it('24. immediately reflects custom rate configuration updates', () => {
    const custom = cloneRates(DEFAULT_RATES);
    custom.bkash.cashOut.normalAgentPerThousand = 15.0;
    custom.npsb.mfsToBankOrMfsPerThousand = 5.0;

    const cashOut = calculateBkashNormalAgent({
      mode: 'desired_amount',
      amountPoisha: bdtToPoisha(1000),
      rates: custom,
      precision: 'whole',
    });
    expect(poishaToBdt(cashOut.feePoisha)).toBe(15);

    const npsb = calculateNpsbOrBankTransfer({
      channel: 'npsb',
      source: 'bkash',
      destination: 'bank',
      mode: 'transfer_amount',
      amountPoisha: bdtToPoisha(10000),
      rates: custom,
      precision: 'whole',
    });
    expect(poishaToBdt(npsb.feePoisha)).toBe(50);
  });

  // 25. ATM denomination restrictions (BDT 500 multiples only!)
  it('25. enforces BDT 500 ATM denominations and never suggests fractional/non-500 withdrawals', () => {
    // Balance 3,600: 3,500 + 52.15 = 3,552.15 <= 3,600 (never 3,547.xx!)
    const from3600 = calculateBkashAtm({
      mode: 'available_balance',
      amountPoisha: bdtToPoisha(3600),
      rates: DEFAULT_RATES,
      sourceType: 'regular',
    });
    expect(from3600.available).toBe(true);
    expect(poishaToBdt(from3600.cashOutAmountPoisha)).toBe(3500);
    expect(from3600.cashOutAmountPoisha % bdtToPoisha(500)).toBe(0);

    // Desired 3,250 -> invalid multiple!
    const badMultiple = calculateBkashAtm({
      mode: 'desired_amount',
      amountPoisha: bdtToPoisha(3250),
      rates: DEFAULT_RATES,
      sourceType: 'regular',
    });
    expect(badMultiple.available).toBe(false);
    expect(badMultiple.unavailableReason).toBe('invalid_atm_multiple');
  });

  // Property-based / randomized invariant tests
  describe('Mathematical Optimality & Safety Invariants (Whole Taka & Precise Modes)', () => {
    const sampleBalances = [
      1, 10, 50, 51, 55, 100, 302.55, 510, 510.75, 999.99, 1018.5, 3000, 3044.7, 3555, 12345.67,
      25212.5, 50000, 125430.25,
    ];

    it('satisfies amount + fee <= balance AND next valid step > balance across all cash-out modes', () => {
      for (const precision of ['whole', 'precise'] as const) {
        const step = precision === 'whole' ? 100 : 1;
        for (const bal of sampleBalances) {
          const balPoisha = bdtToPoisha(bal);

          // bKash Normal
          const norm = calculateBkashNormalAgent({
            mode: 'available_balance',
            amountPoisha: balPoisha,
            rates: DEFAULT_RATES,
            precision,
          });
          if (norm.available) {
            expect(norm.cashOutAmountPoisha + norm.feePoisha).toBeLessThanOrEqual(balPoisha);
            expect(norm.cashOutAmountPoisha % step).toBe(0);
            const nextAmt = norm.cashOutAmountPoisha + step;
            const nextFee = calcPerThousandFeePoisha(
              nextAmt,
              DEFAULT_RATES.bkash.cashOut.normalAgentPerThousand
            );
            expect(nextAmt + nextFee).toBeGreaterThan(balPoisha);
          }

          // Nagad App
          const nagad = calculateNagadCashOut({
            accountType: 'regular',
            mode: 'available_balance',
            amountPoisha: balPoisha,
            rates: DEFAULT_RATES,
            precision,
          }).app;
          if (nagad.available) {
            expect(nagad.cashOutAmountPoisha + nagad.feePoisha).toBeLessThanOrEqual(balPoisha);
            expect(nagad.cashOutAmountPoisha % step).toBe(0);
            const nextAmt = nagad.cashOutAmountPoisha + step;
            const nextFee = calcPerThousandFeePoisha(
              nextAmt,
              DEFAULT_RATES.nagad.cashOut.regularAppPerThousand
            );
            expect(nextAmt + nextFee).toBeGreaterThan(balPoisha);
          }
        }
      }
    });

    it('satisfies optimality invariant for bKash ATM BDT 500 multiples and bKash NPSB limits', () => {
      for (const bal of [3050, 4100, 7777, 15500, 21000, 50000]) {
        const balPoisha = bdtToPoisha(bal);
        const atm = calculateBkashAtm({
          mode: 'available_balance',
          amountPoisha: balPoisha,
          rates: DEFAULT_RATES,
          sourceType: 'regular',
        });
        expect(atm.available).toBe(true);
        expect(atm.totalDeductionPoisha).toBeLessThanOrEqual(balPoisha);
        expect(atm.cashOutAmountPoisha % bdtToPoisha(500)).toBe(0);
        if (atm.cashOutAmountPoisha < bdtToPoisha(DEFAULT_RATES.bkash.cashOut.atmMaxPerTxnBdt)) {
          const next = atm.cashOutAmountPoisha + bdtToPoisha(500);
          const nextFee = calcPerThousandFeePoisha(
            next,
            DEFAULT_RATES.bkash.cashOut.regularAtmPerThousand
          );
          expect(next + nextFee).toBeGreaterThan(balPoisha);
        }

        const npsb = calculateNpsbOrBankTransfer({
          channel: 'npsb',
          source: 'bkash',
          destination: 'bank',
          mode: 'from_balance',
          amountPoisha: balPoisha,
          rates: DEFAULT_RATES,
          precision: 'whole',
        });
        expect(npsb.available).toBe(true);
        expect(npsb.totalDeductionPoisha).toBeLessThanOrEqual(balPoisha);
        if (npsb.transferAmountPoisha < bdtToPoisha(DEFAULT_RATES.npsb.bkashMaxBdt)) {
          const next = npsb.transferAmountPoisha + 100;
          const nextFee = calcPerThousandFeePoisha(
            next,
            DEFAULT_RATES.npsb.mfsToBankOrMfsPerThousand
          );
          expect(next + nextFee).toBeGreaterThan(balPoisha);
        }
      }
    });

    it('holds safety and optimality invariants across 150 seeded randomized balances & usage states', () => {
      // Deterministic LCG PRNG for reproducible property-based testing
      let seed = 20261118;
      const nextRand = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 0x100000000;
      };

      for (let i = 0; i < 150; i++) {
        const balBdt = Number((nextRand() * 120000 + 1).toFixed(2));
        const balPoisha = bdtToPoisha(balBdt);
        const usedBdt = Math.floor(nextRand() * 60000);
        const usedPoisha = bdtToPoisha(usedBdt);

        // bKash Priyo Agent (whole & precise)
        for (const precision of ['whole', 'precise'] as const) {
          const step = precision === 'whole' ? 100 : 1;
          const priyo = calculateBkashPriyoAgent({
            mode: 'available_balance',
            amountPoisha: balPoisha,
            rates: DEFAULT_RATES,
            precision,
            monthlyUsedPoisha: usedPoisha,
          });
          expect(Number.isFinite(priyo.cashOutAmountPoisha)).toBe(true);
          expect(priyo.feePoisha).toBeGreaterThanOrEqual(0);
          expect(priyo.remainingBalancePoisha).toBeGreaterThanOrEqual(0);
          if (priyo.available) {
            expect(priyo.cashOutAmountPoisha + priyo.feePoisha).toBeLessThanOrEqual(balPoisha);
            expect(priyo.cashOutAmountPoisha % step).toBe(0);
            const nextAmt = priyo.cashOutAmountPoisha + step;
            const remAllow = Math.max(0, bdtToPoisha(50000) - usedPoisha);
            const nextRate =
              remAllow > 0 && nextAmt <= remAllow
                ? DEFAULT_RATES.bkash.cashOut.priyoAgentPerThousand
                : DEFAULT_RATES.bkash.cashOut.normalAgentPerThousand;
            const nextFee = calcPerThousandFeePoisha(nextAmt, nextRate);
            expect(nextAmt + nextFee).toBeGreaterThan(balPoisha);
          }
        }

        // bKash Send Money from_balance (Normal & Priyo)
        for (const recipientType of ['normal', 'priyo'] as const) {
          const sm = calculateBkashSendMoney({
            mode: 'from_balance',
            amountPoisha: balPoisha,
            recipientType,
            monthlyUsedPoisha: usedPoisha,
            rates: DEFAULT_RATES,
            precision: 'whole',
          });
          expect(sm.feePoisha).toBeGreaterThanOrEqual(0);
          if (sm.available) {
            expect(sm.recipientReceivesPoisha + sm.feePoisha).toBeLessThanOrEqual(balPoisha);
            expect(sm.remainingBalancePoisha).toBe(balPoisha - sm.totalRequiredPoisha);
          }
        }
      }
    });
  });
});
