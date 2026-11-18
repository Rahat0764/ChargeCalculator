import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { RateConfig } from '../config/rates';
import {
  AtmSourceType,
  CalculationMode,
  NagadAccountType,
  PrecisionMode,
  bdtToPoisha,
  calculateBkashAtm,
  calculateBkashNormalAgent,
  calculateBkashPriyoAgent,
  calculateNagadCashOut,
  formatBdtFromPoisha,
  formatRate,
  parseAmountToPoisha,
  toBengaliDigits,
} from '../engine';
import { Language, Translations } from '../i18n/translations';
import { AmountInputCard } from './AmountInputCard';
import { BrandBadge } from './BrandBadge';
import { ResultCard, ResultRow } from './ResultCard';
import { AtmIcon } from './icons/CustomIcons';

interface CashOutSectionProps {
  t: Translations;
  lang: Language;
  rates: RateConfig;
  precision: PrecisionMode;
  onChangePrecision: (p: PrecisionMode) => void;
  priyoMonthlyUsedRaw: string;
  onChangePriyoMonthlyUsed: (val: string) => void;
}

export const CashOutSection: React.FC<CashOutSectionProps> = ({
  t,
  lang,
  rates,
  precision,
  onChangePrecision,
  priyoMonthlyUsedRaw,
  onChangePriyoMonthlyUsed,
}) => {
  const [provider, setProvider] = useState<'bkash' | 'nagad'>('bkash');
  const [nagadType, setNagadType] = useState<NagadAccountType>('regular');
  const [mode, setMode] = useState<CalculationMode>('available_balance');
  const [amountRaw, setAmountRaw] = useState<string>('510');
  const [optionalBalanceRaw, setOptionalBalanceRaw] = useState<string>('');
  const [showPriyoTracker, setShowPriyoTracker] = useState<boolean>(false);
  const [atmSource, setAtmSource] = useState<AtmSourceType>('regular');
  const [remittanceBalanceRaw, setRemittanceBalanceRaw] = useState<string>('');

  const parsedAmount = parseAmountToPoisha(amountRaw);
  const isInvalid = amountRaw.trim() !== '' && parsedAmount === null;
  const amountPoisha = parsedAmount ?? 0;

  const optionalBalancePoisha =
    mode === 'desired_amount' ? parseAmountToPoisha(optionalBalanceRaw) : null;
  const priyoUsedPoisha = parseAmountToPoisha(priyoMonthlyUsedRaw) ?? 0;
  const remittanceBalancePoisha =
    atmSource === 'remittance' ? parseAmountToPoisha(remittanceBalanceRaw) : null;

  const bkashNormal = useMemo(
    () =>
      calculateBkashNormalAgent({
        mode,
        amountPoisha,
        rates,
        precision,
        optionalBalancePoisha,
      }),
    [mode, amountPoisha, rates, precision, optionalBalancePoisha]
  );

  const bkashPriyo = useMemo(
    () =>
      calculateBkashPriyoAgent({
        mode,
        amountPoisha,
        rates,
        precision,
        monthlyUsedPoisha: priyoUsedPoisha,
        optionalBalancePoisha,
      }),
    [mode, amountPoisha, rates, precision, priyoUsedPoisha, optionalBalancePoisha]
  );

  const bkashAtm = useMemo(
    () =>
      calculateBkashAtm({
        mode,
        amountPoisha,
        rates,
        sourceType: atmSource,
        eligibleRemittanceBalancePoisha: remittanceBalancePoisha,
        optionalBalancePoisha,
      }),
    [mode, amountPoisha, rates, atmSource, remittanceBalancePoisha, optionalBalancePoisha]
  );

  const nagadResults = useMemo(
    () =>
      calculateNagadCashOut({
        accountType: nagadType,
        mode,
        amountPoisha,
        rates,
        precision,
        optionalBalancePoisha,
      }),
    [nagadType, mode, amountPoisha, rates, precision, optionalBalancePoisha]
  );

  const atmMinPoisha = bdtToPoisha(rates.bkash.cashOut.atmMinBdt);
  const shouldRevealAtm = provider === 'bkash' && amountPoisha >= atmMinPoisha;

  const showDecimals = precision === 'precise';

  const handleReset = () => {
    setAmountRaw('');
    setOptionalBalanceRaw('');
    setRemittanceBalanceRaw('');
  };

  // Savings comparisons
  const priyoIsCheaper =
    bkashPriyo.available &&
    bkashNormal.available &&
    (mode === 'available_balance'
      ? bkashPriyo.cashOutAmountPoisha > bkashNormal.cashOutAmountPoisha ||
        (bkashPriyo.cashOutAmountPoisha === bkashNormal.cashOutAmountPoisha &&
          bkashPriyo.feePoisha < bkashNormal.feePoisha)
      : bkashPriyo.feePoisha < bkashNormal.feePoisha);

  const priyoSavings = priyoIsCheaper
    ? mode === 'available_balance'
      ? Math.max(
          0,
          bkashPriyo.cashOutAmountPoisha - bkashNormal.cashOutAmountPoisha ||
            bkashNormal.feePoisha - bkashPriyo.feePoisha
        )
      : Math.max(0, bkashNormal.feePoisha - bkashPriyo.feePoisha)
    : 0;

  const nagadAppCheaper =
    nagadType === 'regular' &&
    nagadResults.app.available &&
    nagadResults.ussd.available &&
    (mode === 'available_balance'
      ? nagadResults.app.cashOutAmountPoisha > nagadResults.ussd.cashOutAmountPoisha ||
        (nagadResults.app.cashOutAmountPoisha === nagadResults.ussd.cashOutAmountPoisha &&
          nagadResults.app.feePoisha < nagadResults.ussd.feePoisha)
      : nagadResults.app.feePoisha < nagadResults.ussd.feePoisha);

  const nagadSavings = nagadAppCheaper
    ? mode === 'available_balance'
      ? Math.max(
          0,
          nagadResults.app.cashOutAmountPoisha - nagadResults.ussd.cashOutAmountPoisha ||
            nagadResults.ussd.feePoisha - nagadResults.app.feePoisha
        )
      : Math.max(0, nagadResults.ussd.feePoisha - nagadResults.app.feePoisha)
    : 0;

  const buildRows = (res: typeof bkashNormal): ResultRow[] => {
    const rows: ResultRow[] = [
      { label: t.common.cashOutCharge, poisha: res.feePoisha, emphasis: 'fee' },
      {
        label: mode === 'available_balance' ? t.common.totalDeduction : t.common.totalRequired,
        poisha: res.totalDeductionPoisha,
      },
    ];
    if (mode === 'available_balance' || res.affordable) {
      rows.push({
        label: t.common.remainingBalance,
        poisha: res.remainingBalancePoisha,
        emphasis: 'positive',
      });
    }
    rows.push({
      label: t.common.effectiveRate,
      text: `${res.effectivePercent.toFixed(2)}% (${formatRate(res.effectiveRatePerThousand, lang)}/1,000)`,
      emphasis: 'muted',
    });
    return rows;
  };

  const buildCopyText = (title: string, res: typeof bkashNormal) => {
    const amt = formatBdtFromPoisha(res.cashOutAmountPoisha, { locale: lang, showDecimals });
    const fee = formatBdtFromPoisha(res.feePoisha, { locale: lang });
    const total = formatBdtFromPoisha(res.totalDeductionPoisha, { locale: lang });
    const rem = formatBdtFromPoisha(res.remainingBalancePoisha, { locale: lang });
    return `${title}\n${mode === 'available_balance' ? t.common.maxWithdrawable : t.common.requestedAmount}: ${amt}\n${t.common.cashOutCharge}: ${fee}\n${mode === 'available_balance' ? t.common.totalDeduction : t.common.totalRequired}: ${total}${
      mode === 'available_balance' ? `\n${t.common.remainingBalance}: ${rem}` : ''
    }`;
  };

  const atmUnavailableText = (() => {
    if (bkashAtm.available) return undefined;
    switch (bkashAtm.unavailableReason) {
      case 'below_atm_minimum':
        return t.cashOut.atmUnavailableBelowMin;
      case 'atm_insufficient_with_fee':
        return `${t.cashOut.atmUnavailableNeedFee} (${t.cashOut.atmMinFeeNote}: ${formatBdtFromPoisha(
          bkashAtm.atmMinRequiredBalancePoisha ?? 0,
          { locale: lang }
        )})`;
      case 'invalid_atm_multiple':
        return t.cashOut.atmUnavailableMultiple;
      case 'exceeds_atm_max':
        return `${t.cashOut.atmUnavailableExceedsMax} (${formatBdtFromPoisha(
          bkashAtm.atmMaxPoisha ?? 0,
          { locale: lang, showDecimals: false }
        )})`;
      case 'no_eligible_remittance':
        return t.cashOut.atmUnavailableNoRemittance;
      default:
        return t.common.enterAmountPrompt;
    }
  })();

  const priyoNote = (() => {
    if (bkashPriyo.priyoStatus === 'allowance_exhausted') return t.cashOut.priyoExhaustedNote;
    if (bkashPriyo.priyoStatus === 'crossing_allowance_normal_rate')
      return t.cashOut.priyoCrossingNote;
    return undefined;
  })();

  const priyoRemainingPoisha = bkashPriyo.priyoRemainingAllowancePoisha ?? 0;
  const priyoAllowancePoisha = bkashPriyo.priyoMonthlyAllowancePoisha ?? bdtToPoisha(50000);
  const priyoUsedPct = Math.min(
    100,
    priyoAllowancePoisha > 0 ? Math.round((priyoUsedPoisha / priyoAllowancePoisha) * 100) : 0
  );

  return (
    <div className="space-y-4">
      {/* Provider Switcher */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setProvider('bkash')}
          data-testid="provider-bkash"
          className={`flex items-center justify-center gap-2.5 rounded-2xl border p-3 transition active:scale-[0.99] ${
            provider === 'bkash'
              ? 'border-bkash bg-bkash-soft/70 shadow-sm dark:border-bkash dark:bg-bkash/15'
              : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80'
          }`}
        >
          <BrandBadge brand="bkash" size="sm" />
          <span className="text-sm font-bold text-slate-900 dark:text-white">{t.cashOut.bkash}</span>
        </button>

        <button
          type="button"
          onClick={() => setProvider('nagad')}
          data-testid="provider-nagad"
          className={`flex items-center justify-center gap-2.5 rounded-2xl border p-3 transition active:scale-[0.99] ${
            provider === 'nagad'
              ? 'border-nagad bg-nagad-soft/70 shadow-sm dark:border-nagad dark:bg-nagad/15'
              : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80'
          }`}
        >
          <BrandBadge brand={nagadType === 'islamic' ? 'nagad-islamic' : 'nagad'} size="sm" />
          <span className="text-sm font-bold text-slate-900 dark:text-white">{t.cashOut.nagad}</span>
        </button>
      </div>

      {/* Nagad Regular vs Islamic Sub-Toggle */}
      {provider === 'nagad' && (
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setNagadType('regular')}
            data-testid="nagad-regular-btn"
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition sm:text-sm ${
              nagadType === 'regular'
                ? 'bg-nagad text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {t.cashOut.nagadRegular}
          </button>
          <button
            type="button"
            onClick={() => setNagadType('islamic')}
            data-testid="nagad-islamic-btn"
            className={`flex-1 rounded-xl py-2 text-xs font-bold transition sm:text-sm ${
              nagadType === 'islamic'
                ? 'bg-islamic text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {t.cashOut.nagadIslamic}
          </button>
        </div>
      )}

      {/* Primary Amount Input Card */}
      <AmountInputCard
        t={t}
        lang={lang}
        label={mode === 'available_balance' ? t.common.yourBalance : t.common.desiredCashOut}
        value={amountRaw}
        onChange={setAmountRaw}
        onReset={handleReset}
        modeLabelA={t.cashOut.modeAvailable}
        modeLabelB={t.cashOut.modeDesired}
        isModeA={mode === 'available_balance'}
        onSwapMode={() =>
          setMode((prev) => (prev === 'available_balance' ? 'desired_amount' : 'available_balance'))
        }
        precision={precision}
        onChangePrecision={onChangePrecision}
        accentClass={
          provider === 'bkash'
            ? 'focus-within:border-bkash dark:focus-within:border-bkash'
            : nagadType === 'islamic'
              ? 'focus-within:border-islamic dark:focus-within:border-islamic'
              : 'focus-within:border-nagad dark:focus-within:border-nagad'
        }
        invalid={isInvalid}
        optionalBalance={
          mode === 'desired_amount'
            ? { value: optionalBalanceRaw, onChange: setOptionalBalanceRaw }
            : undefined
        }
      />

      {/* Priyo Agent Monthly Usage Tracker (bKash) */}
      {provider === 'bkash' && (
        <section className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-4">
          <button
            type="button"
            onClick={() => setShowPriyoTracker((v) => !v)}
            data-testid="priyo-tracker-toggle"
            className="flex w-full items-center justify-between gap-2 text-left"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                  {t.cashOut.priyoMonthlyTitle}
                </span>
                <span className="rounded-full bg-bkash-soft px-2 py-0.5 text-[11px] font-semibold text-bkash dark:bg-bkash/20 dark:text-pink-300">
                  {t.cashOut.priyoRemaining}:{' '}
                  {formatBdtFromPoisha(priyoRemainingPoisha, {
                    locale: lang,
                    showDecimals: false,
                  })}
                </span>
              </div>
            </div>
            {showPriyoTracker ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
            )}
          </button>

          {showPriyoTracker && (
            <div className="mt-3.5 space-y-3 border-t border-slate-100 pt-3.5 dark:border-slate-800">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-950/70">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.cashOut.priyoAllowance}
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-slate-900 tabular-nums-fintech dark:text-white sm:text-sm">
                    {formatBdtFromPoisha(priyoAllowancePoisha, {
                      locale: lang,
                      showDecimals: false,
                    })}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-950/70">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.cashOut.priyoUsed}
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-amber-600 tabular-nums-fintech dark:text-amber-400 sm:text-sm">
                    {formatBdtFromPoisha(priyoUsedPoisha, {
                      locale: lang,
                      showDecimals: false,
                    })}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-950/70">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.cashOut.priyoRemaining}
                  </div>
                  <div className="mt-0.5 text-xs font-bold text-emerald-700 tabular-nums-fintech dark:text-emerald-400 sm:text-sm">
                    {formatBdtFromPoisha(priyoRemainingPoisha, {
                      locale: lang,
                      showDecimals: false,
                    })}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    priyoUsedPct >= 100
                      ? 'bg-rose-500'
                      : priyoUsedPct >= 80
                        ? 'bg-amber-500'
                        : 'bg-bkash'
                  }`}
                  style={{ width: `${priyoUsedPct}%` }}
                />
              </div>

              <div>
                <label
                  htmlFor="priyo-monthly-used"
                  className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  {t.cashOut.priyoMonthlyUsed}
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950/60">
                  <span className="mr-2 text-sm font-semibold text-slate-400">
                    {lang === 'bn' ? '৳' : 'BDT'}
                  </span>
                  <input
                    id="priyo-monthly-used"
                    data-testid="priyo-used-input"
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={priyoMonthlyUsedRaw}
                    onChange={(e) => onChangePriyoMonthlyUsed(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none tabular-nums-fintech dark:text-white"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {t.common.monthlyResetNote}
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Results Area */}
      {amountPoisha <= 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
          {t.common.enterAmountPrompt}
        </div>
      ) : provider === 'bkash' ? (
        <div className="space-y-4">
          {/* Simultaneous Comparison: Priyo Agent vs Normal Agent */}
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            <ResultCard
              t={t}
              lang={lang}
              testId="card-bkash-priyo"
              title={t.cashOut.priyoAgent}
              subtitle={`${formatRate(bkashPriyo.effectiveRatePerThousand, lang)} ${t.common.perThousand}`}
              badge={
                bkashPriyo.priyoStatus === 'discounted'
                  ? `${formatRate(rates.bkash.cashOut.priyoAgentPerThousand, lang)}/${lang === 'bn' ? '১,০০০' : '1,000'}`
                  : undefined
              }
              isBest={priyoIsCheaper}
              savingsPoisha={priyoSavings}
              primaryLabel={
                mode === 'available_balance'
                  ? t.common.maxWithdrawable
                  : t.common.requestedAmount
              }
              primaryPoisha={bkashPriyo.cashOutAmountPoisha}
              showDecimals={showDecimals}
              rows={buildRows(bkashPriyo)}
              unavailableMessage={
                !bkashPriyo.available ? t.common.insufficientBalance : undefined
              }
              affordable={bkashPriyo.affordable}
              shortfallPoisha={bkashPriyo.shortfallPoisha}
              note={priyoNote}
              noteTone={priyoNote ? 'warning' : 'info'}
              copySummaryText={buildCopyText(`bKash ${t.cashOut.priyoAgent}`, bkashPriyo)}
            />

            <ResultCard
              t={t}
              lang={lang}
              testId="card-bkash-normal"
              title={t.cashOut.normalAgent}
              subtitle={`${formatRate(rates.bkash.cashOut.normalAgentPerThousand, lang)} ${t.common.perThousand}`}
              primaryLabel={
                mode === 'available_balance'
                  ? t.common.maxWithdrawable
                  : t.common.requestedAmount
              }
              primaryPoisha={bkashNormal.cashOutAmountPoisha}
              showDecimals={showDecimals}
              rows={buildRows(bkashNormal)}
              unavailableMessage={
                !bkashNormal.available ? t.common.insufficientBalance : undefined
              }
              affordable={bkashNormal.affordable}
              shortfallPoisha={bkashNormal.shortfallPoisha}
              copySummaryText={buildCopyText(`bKash ${t.cashOut.normalAgent}`, bkashNormal)}
            />
          </div>

          {/* ATM Cash-Out Section (Revealed when entered amount >= BDT 3,000) */}
          {shouldRevealAtm && (
            <section
              data-testid="bkash-atm-section"
              className="animate-subtle-pop rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-5"
            >
              <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                    <AtmIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                      {t.cashOut.atmSectionTitle}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.cashOut.atmDenominationNote}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                  {bkashAtm.available ? t.common.available : t.common.unavailable}
                </span>
              </div>

              {/* ATM Source Selector: Regular vs Eligible Remittance */}
              <div className="mb-3.5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
                <button
                  type="button"
                  onClick={() => setAtmSource('regular')}
                  data-testid="atm-source-regular"
                  className={`rounded-lg px-2.5 py-2 text-xs font-bold transition ${
                    atmSource === 'regular'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  {t.cashOut.atmSourceRegular} (
                  {formatRate(rates.bkash.cashOut.regularAtmPerThousand, lang)})
                </button>
                <button
                  type="button"
                  onClick={() => setAtmSource('remittance')}
                  data-testid="atm-source-remittance"
                  className={`rounded-lg px-2.5 py-2 text-xs font-bold transition ${
                    atmSource === 'remittance'
                      ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-700 dark:text-emerald-300'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  {t.cashOut.atmSourceRemittance} (
                  {formatRate(rates.bkash.cashOut.remittanceAtmPerThousand, lang)})
                </button>
              </div>

              {/* Optional Eligible Remittance Balance Input */}
              {atmSource === 'remittance' && (
                <div className="mb-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3 dark:border-emerald-800/50 dark:bg-emerald-950/20">
                  <label
                    htmlFor="remittance-balance-input"
                    className="mb-1 block text-xs font-semibold text-emerald-900 dark:text-emerald-200"
                  >
                    {t.cashOut.atmRemittanceBalanceLabel}
                  </label>
                  <div className="flex items-center rounded-lg border border-emerald-200 bg-white px-3 py-1.5 dark:border-emerald-800 dark:bg-slate-950">
                    <span className="mr-2 text-xs font-bold text-slate-400">
                      {lang === 'bn' ? '৳' : 'BDT'}
                    </span>
                    <input
                      id="remittance-balance-input"
                      data-testid="remittance-balance-input"
                      type="text"
                      inputMode="decimal"
                      placeholder={
                        lang === 'bn'
                          ? toBengaliDigits(amountRaw || '0')
                          : amountRaw || '0'
                      }
                      value={remittanceBalanceRaw}
                      onChange={(e) => setRemittanceBalanceRaw(e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none tabular-nums-fintech dark:text-white"
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                    {t.cashOut.atmRemittanceNote}
                  </p>
                </div>
              )}

              <ResultCard
                t={t}
                lang={lang}
                testId="card-bkash-atm"
                title={
                  atmSource === 'remittance'
                    ? `${t.cashOut.atmSectionTitle} — ${t.cashOut.atmSourceRemittance}`
                    : `${t.cashOut.atmSectionTitle} — ${t.cashOut.atmSourceRegular}`
                }
                subtitle={`${formatRate(bkashAtm.effectiveRatePerThousand, lang)} ${t.common.perThousand}`}
                isBest={
                  bkashAtm.available &&
                  atmSource === 'remittance' &&
                  bkashAtm.effectiveRatePerThousand < bkashPriyo.effectiveRatePerThousand
                }
                primaryLabel={
                  mode === 'available_balance'
                    ? t.common.maxWithdrawable
                    : t.common.requestedAmount
                }
                primaryPoisha={bkashAtm.cashOutAmountPoisha}
                showDecimals={false}
                rows={buildRows(bkashAtm)}
                unavailableMessage={atmUnavailableText}
                affordable={bkashAtm.affordable}
                shortfallPoisha={bkashAtm.shortfallPoisha}
                note={
                  bkashAtm.cappedByAtmMax
                    ? `${t.common.cappedAtMax} (${formatBdtFromPoisha(
                        bkashAtm.atmMaxPoisha ?? 0,
                        { locale: lang, showDecimals: false }
                      )})`
                    : undefined
                }
                copySummaryText={buildCopyText(`bKash ATM`, bkashAtm)}
              />
            </section>
          )}
        </div>
      ) : (
        /* Nagad Results (Regular App & USSD or Islamic App & USSD) */
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
            <ResultCard
              t={t}
              lang={lang}
              testId="card-nagad-app"
              title={
                nagadType === 'islamic'
                  ? `${t.cashOut.nagadIslamic} — ${t.cashOut.nagadApp}`
                  : `${t.cashOut.nagadApp}`
              }
              subtitle={`${formatRate(nagadResults.app.effectiveRatePerThousand, lang)} ${t.common.perThousand}`}
              isBest={nagadAppCheaper}
              savingsPoisha={nagadSavings}
              primaryLabel={
                mode === 'available_balance'
                  ? t.common.maxWithdrawable
                  : t.common.requestedAmount
              }
              primaryPoisha={nagadResults.app.cashOutAmountPoisha}
              showDecimals={showDecimals}
              rows={buildRows(nagadResults.app)}
              unavailableMessage={
                !nagadResults.app.available ? t.common.insufficientBalance : undefined
              }
              affordable={nagadResults.app.affordable}
              shortfallPoisha={nagadResults.app.shortfallPoisha}
              copySummaryText={buildCopyText(
                `Nagad ${nagadType === 'islamic' ? 'Islamic ' : ''}App`,
                nagadResults.app
              )}
            />

            <ResultCard
              t={t}
              lang={lang}
              testId="card-nagad-ussd"
              title={
                nagadType === 'islamic'
                  ? `${t.cashOut.nagadIslamic} — ${t.cashOut.nagadUssd}`
                  : `${t.cashOut.nagadUssd}`
              }
              subtitle={`${formatRate(nagadResults.ussd.effectiveRatePerThousand, lang)} ${t.common.perThousand}`}
              primaryLabel={
                mode === 'available_balance'
                  ? t.common.maxWithdrawable
                  : t.common.requestedAmount
              }
              primaryPoisha={nagadResults.ussd.cashOutAmountPoisha}
              showDecimals={showDecimals}
              rows={buildRows(nagadResults.ussd)}
              unavailableMessage={
                !nagadResults.ussd.available ? t.common.insufficientBalance : undefined
              }
              affordable={nagadResults.ussd.affordable}
              shortfallPoisha={nagadResults.ussd.shortfallPoisha}
              copySummaryText={buildCopyText(
                `Nagad ${nagadType === 'islamic' ? 'Islamic ' : ''}USSD`,
                nagadResults.ussd
              )}
            />
          </div>

          <p className="flex items-center gap-1.5 px-1 text-xs text-slate-500 dark:text-slate-400">
            <Info className="h-3.5 w-3.5 shrink-0" />
            {t.cashOut.nagadVatNote}
          </p>
        </div>
      )}
    </div>
  );
};
