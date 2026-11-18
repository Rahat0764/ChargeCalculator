import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { RateConfig } from '../config/rates';
import {
  DirectBankRatePreset,
  PrecisionMode,
  TransferChannel,
  TransferDestination,
  TransferMode,
  TransferSource,
  calculateNpsbOrBankTransfer,
  formatBdtFromPoisha,
  formatRate,
  getNpsbDestinationsForSource,
  parseAmountToPoisha,
} from '../engine';
import { Language, Translations } from '../i18n/translations';
import { AmountInputCard } from './AmountInputCard';
import { BrandBadge, BrandId } from './BrandBadge';
import { ResultCard, ResultRow } from './ResultCard';
import { BankTransferIcon, NpsbIcon } from './icons/CustomIcons';

interface NpsbSectionProps {
  t: Translations;
  lang: Language;
  rates: RateConfig;
  precision: PrecisionMode;
  onChangePrecision: (p: PrecisionMode) => void;
}

const PROVIDER_LABELS: Record<TransferSource | TransferDestination, { bn: string; en: string }> = {
  bkash: { bn: 'বিকাশ', en: 'bKash' },
  nagad: { bn: 'নগদ', en: 'Nagad' },
  rocket: { bn: 'রকেট', en: 'Rocket' },
  bank: { bn: 'ব্যাংক', en: 'Bank' },
};

export const NpsbSection: React.FC<NpsbSectionProps> = ({
  t,
  lang,
  rates,
  precision,
  onChangePrecision,
}) => {
  const [channel, setChannel] = useState<TransferChannel>('npsb');
  const [source, setSource] = useState<TransferSource>('bkash');
  const [destination, setDestination] = useState<TransferDestination>('bank');
  const [directBankPreset, setDirectBankPreset] = useState<DirectBankRatePreset>('standard_12_5');
  const [mode, setMode] = useState<TransferMode>('transfer_amount');
  const [amountRaw, setAmountRaw] = useState<string>('5000');

  const validDestinations = getNpsbDestinationsForSource(source);
  const effectiveDestination: TransferDestination =
    channel === 'direct_bkash_to_bank'
      ? 'bank'
      : validDestinations.includes(destination)
        ? destination
        : validDestinations[0];

  const handleChangeSource = (nextSource: TransferSource) => {
    setSource(nextSource);
    const nextDests = getNpsbDestinationsForSource(nextSource);
    if (!nextDests.includes(destination)) {
      setDestination(nextDests[0]);
    }
  };

  const parsedAmount = parseAmountToPoisha(amountRaw);
  const isInvalid = amountRaw.trim() !== '' && parsedAmount === null;
  const amountPoisha = parsedAmount ?? 0;

  const result = useMemo(
    () =>
      calculateNpsbOrBankTransfer({
        channel,
        source,
        destination: effectiveDestination,
        mode,
        amountPoisha,
        rates,
        precision,
        directBankPreset,
      }),
    [channel, source, effectiveDestination, mode, amountPoisha, rates, precision, directBankPreset]
  );

  const showDecimals = precision === 'precise';

  const sourceBrand: BrandId = channel === 'direct_bkash_to_bank' ? 'bkash' : source;
  const destBrand: BrandId = effectiveDestination;
  const sourceName = PROVIDER_LABELS[sourceBrand][lang];
  const destName = PROVIDER_LABELS[destBrand][lang];

  const unavailableMessage = (() => {
    if (result.available) return undefined;
    switch (result.unavailableReason) {
      case 'below_minimum':
        return `${t.npsb.belowMin} (${formatBdtFromPoisha(result.minLimitPoisha ?? 0, {
          locale: lang,
          showDecimals: false,
        })})`;
      case 'above_maximum':
        return `${t.npsb.aboveMax} (${formatBdtFromPoisha(result.maxLimitPoisha ?? 0, {
          locale: lang,
          showDecimals: false,
        })})`;
      case 'insufficient_for_minimum':
        return `${t.npsb.insufficientForMin}${
          result.minRequiredBalancePoisha
            ? ` (${formatBdtFromPoisha(result.minRequiredBalancePoisha, { locale: lang })})`
            : ''
        }`;
      default:
        return t.common.enterAmountPrompt;
    }
  })();

  const rows: ResultRow[] = [
    { label: t.npsb.senderWallet, text: sourceName },
    { label: t.npsb.recipientTarget, text: destName },
    {
      label: t.common.recipientReceives,
      poisha: result.recipientReceivesPoisha,
      emphasis: 'positive',
    },
    { label: t.common.transactionFee, poisha: result.feePoisha, emphasis: 'fee' },
    {
      label: mode === 'transfer_amount' ? t.common.totalRequired : t.common.totalDeduction,
      poisha: result.totalDeductionPoisha,
    },
    ...(mode === 'from_balance'
      ? [
          {
            label: t.common.remainingBalance,
            poisha: result.remainingBalancePoisha,
            emphasis: 'muted' as const,
          },
        ]
      : []),
    {
      label: t.common.effectiveRate,
      text: `${formatRate(result.ratePerThousand, lang)}/1,000 (${(result.ratePerThousand / 10).toFixed(2)}%)`,
      emphasis: 'muted',
    },
  ];

  const copySummaryText = `${channel === 'npsb' ? 'NPSB' : 'Direct bKash → Bank'} (${sourceName} → ${destName})\n${
    t.common.recipientReceives
  }: ${formatBdtFromPoisha(result.recipientReceivesPoisha, {
    locale: lang,
    showDecimals,
  })}\n${t.common.transactionFee}: ${formatBdtFromPoisha(result.feePoisha, { locale: lang })}\n${
    mode === 'transfer_amount' ? t.common.totalRequired : t.common.totalDeduction
  }: ${formatBdtFromPoisha(result.totalDeductionPoisha, { locale: lang })}`;

  return (
    <div className="space-y-4">
      {/* Channel Toggle: Verified NPSB vs Non-NPSB Direct bKash-to-Bank */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setChannel('npsb')}
          data-testid="channel-npsb"
          className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition sm:text-sm ${
            channel === 'npsb'
              ? 'border-npsb bg-npsb-soft/80 text-npsb shadow-sm dark:bg-npsb/20 dark:text-teal-300'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <NpsbIcon className="h-4 w-4" />
          <span>{t.npsb.channelNpsb}</span>
        </button>

        <button
          type="button"
          onClick={() => setChannel('direct_bkash_to_bank')}
          data-testid="channel-direct-bank"
          className={`flex items-center justify-center gap-2 rounded-2xl border p-3 text-xs font-bold transition sm:text-sm ${
            channel === 'direct_bkash_to_bank'
              ? 'border-bkash bg-bkash-soft/70 text-bkash shadow-sm dark:bg-bkash/20 dark:text-pink-300'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
          }`}
        >
          <BankTransferIcon className="h-4 w-4" />
          <span>{t.npsb.channelDirectBank}</span>
        </button>
      </div>

      {/* Route Selector Card */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        {/* Visual Direction Banner */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3.5 py-2.5 dark:bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <BrandBadge brand={sourceBrand} size="sm" />
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <BrandBadge brand={destBrand} size="sm" />
          </div>

          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              result.routeAvailability === 'verified'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
            }`}
          >
            {result.routeAvailability === 'verified' ? (
              <CheckCircle2 className="h-3 w-3" />
            ) : (
              <AlertTriangle className="h-3 w-3" />
            )}
            {result.routeAvailability === 'verified'
              ? t.common.verifiedRoute
              : t.common.confirmInApp}
          </span>
        </div>

        {channel === 'npsb' ? (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {/* Source Wallet */}
            <div>
              <div className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t.npsb.fromWallet}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(['bkash', 'nagad'] as TransferSource[]).map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => handleChangeSource(src)}
                    data-testid={`npsb-src-${src}`}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition ${
                      source === src
                        ? 'border-npsb bg-npsb-soft text-npsb dark:bg-npsb/20 dark:text-teal-300'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {PROVIDER_LABELS[src][lang]}
                  </button>
                ))}
              </div>
            </div>

            {/* Destination */}
            <div>
              <div className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t.npsb.toDestination}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {validDestinations.map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => setDestination(dest)}
                    data-testid={`npsb-dest-${dest}`}
                    className={`rounded-xl border py-2 text-xs font-bold transition ${
                      effectiveDestination === dest
                        ? 'border-npsb bg-npsb-soft text-npsb dark:bg-npsb/20 dark:text-teal-300'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {PROVIDER_LABELS[dest][lang]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Direct bKash-to-Bank Non-NPSB Preset Selector */
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {t.npsb.directBankRateLabel}
              </span>
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                {t.npsb.directBankBadge}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirectBankPreset('partner_10')}
                data-testid="direct-bank-10"
                className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                  directBankPreset === 'partner_10'
                    ? 'border-bkash bg-bkash-soft text-bkash dark:bg-bkash/20 dark:text-pink-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {t.npsb.partnerRate10}
              </button>
              <button
                type="button"
                onClick={() => setDirectBankPreset('standard_12_5')}
                data-testid="direct-bank-125"
                className={`rounded-xl border py-2.5 text-xs font-bold transition ${
                  directBankPreset === 'standard_12_5'
                    ? 'border-bkash bg-bkash-soft text-bkash dark:bg-bkash/20 dark:text-pink-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {t.npsb.standardRate125}
              </button>
            </div>
          </div>
        )}

        {/* Limit Range Info */}
        {result.minLimitPoisha !== null && result.maxLimitPoisha !== null && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span>{t.npsb.limitRange}</span>
            <span className="font-semibold text-slate-700 tabular-nums-fintech dark:text-slate-300">
              {formatBdtFromPoisha(result.minLimitPoisha, { locale: lang, showDecimals: false })} –{' '}
              {formatBdtFromPoisha(result.maxLimitPoisha, { locale: lang, showDecimals: false })}
            </span>
          </div>
        )}
      </section>

      {/* Primary Input */}
      <AmountInputCard
        t={t}
        lang={lang}
        label={mode === 'transfer_amount' ? t.common.transferAmount : t.common.yourBalance}
        value={amountRaw}
        onChange={setAmountRaw}
        onReset={() => setAmountRaw('')}
        modeLabelA={t.npsb.modeTransferAmount}
        modeLabelB={t.npsb.modeFromBalance}
        isModeA={mode === 'transfer_amount'}
        onSwapMode={() =>
          setMode((prev) => (prev === 'transfer_amount' ? 'from_balance' : 'transfer_amount'))
        }
        precision={precision}
        onChangePrecision={onChangePrecision}
        accentClass={
          channel === 'npsb'
            ? 'focus-within:border-npsb'
            : 'focus-within:border-bkash'
        }
        invalid={isInvalid}
      />

      {/* Result Card */}
      {amountPoisha <= 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
          {t.common.enterAmountPrompt}
        </div>
      ) : (
        <ResultCard
          t={t}
          lang={lang}
          testId="card-npsb-result"
          title={`${sourceName} → ${destName}`}
          subtitle={
            channel === 'npsb'
              ? `NPSB • ${formatRate(result.ratePerThousand, lang)} ${t.common.perThousand}`
              : `${t.npsb.directBankBadge} • ${formatRate(result.ratePerThousand, lang)} ${t.common.perThousand}`
          }
          primaryLabel={
            mode === 'transfer_amount' ? t.common.totalRequired : t.common.maxTransferable
          }
          primaryPoisha={
            mode === 'transfer_amount'
              ? result.totalDeductionPoisha
              : result.transferAmountPoisha
          }
          showDecimals={showDecimals}
          rows={rows}
          unavailableMessage={unavailableMessage}
          note={
            result.cappedByMaxLimit
              ? `${t.common.cappedAtMax} (${formatBdtFromPoisha(result.maxLimitPoisha ?? 0, {
                  locale: lang,
                  showDecimals: false,
                })})`
              : channel === 'direct_bkash_to_bank'
                ? t.npsb.directBankWarning
                : result.routeAvailability === 'confirm_in_app'
                  ? t.npsb.confirmProviderNote
                  : t.npsb.verifiedNpsbNote
          }
          noteTone={
            channel === 'direct_bkash_to_bank' || result.routeAvailability === 'confirm_in_app'
              ? 'warning'
              : 'info'
          }
          copySummaryText={copySummaryText}
        />
      )}
    </div>
  );
};
