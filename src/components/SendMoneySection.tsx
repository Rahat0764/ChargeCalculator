import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { RateConfig } from '../config/rates';
import {
  BkashRecipientType,
  NagadChannel,
  PrecisionMode,
  SendMoneyMode,
  SendMoneyProvider,
  calculateBkashSendMoney,
  calculateNagadSendMoney,
  formatBdtFromPoisha,
  parseAmountToPoisha,
} from '../engine';
import { Language, Translations } from '../i18n/translations';
import { AmountInputCard } from './AmountInputCard';
import { BrandBadge } from './BrandBadge';
import { ResultCard, ResultRow } from './ResultCard';

interface SendMoneySectionProps {
  t: Translations;
  lang: Language;
  rates: RateConfig;
  precision: PrecisionMode;
  onChangePrecision: (p: PrecisionMode) => void;
  bkashMonthlyUsedRaw: string;
  onChangeBkashMonthlyUsed: (val: string) => void;
}

export const SendMoneySection: React.FC<SendMoneySectionProps> = ({
  t,
  lang,
  rates,
  precision,
  onChangePrecision,
  bkashMonthlyUsedRaw,
  onChangeBkashMonthlyUsed,
}) => {
  const [provider, setProvider] = useState<SendMoneyProvider>('bkash');
  const [mode, setMode] = useState<SendMoneyMode>('send_exact');
  const [amountRaw, setAmountRaw] = useState<string>('500');
  const [bkashRecipient, setBkashRecipient] = useState<BkashRecipientType>('normal');
  const [nagadChannel, setNagadChannel] = useState<NagadChannel>('app');
  const [showMonthlyInput, setShowMonthlyInput] = useState<boolean>(false);

  const parsedAmount = parseAmountToPoisha(amountRaw);
  const isInvalid = amountRaw.trim() !== '' && parsedAmount === null;
  const amountPoisha = parsedAmount ?? 0;
  const monthlyUsedPoisha = parseAmountToPoisha(bkashMonthlyUsedRaw) ?? 0;

  const bkashNormalRes = useMemo(
    () =>
      calculateBkashSendMoney({
        mode,
        amountPoisha,
        recipientType: 'normal',
        monthlyUsedPoisha,
        rates,
        precision,
      }),
    [mode, amountPoisha, monthlyUsedPoisha, rates, precision]
  );

  const bkashPriyoRes = useMemo(
    () =>
      calculateBkashSendMoney({
        mode,
        amountPoisha,
        recipientType: 'priyo',
        monthlyUsedPoisha,
        rates,
        precision,
      }),
    [mode, amountPoisha, monthlyUsedPoisha, rates, precision]
  );

  const nagadRes = useMemo(
    () =>
      calculateNagadSendMoney({
        accountType: provider === 'nagad_islamic' ? 'islamic' : 'regular',
        channel: nagadChannel,
        mode,
        amountPoisha,
        rates,
        precision,
      }),
    [provider, nagadChannel, mode, amountPoisha, rates, precision]
  );

  const showDecimals = precision === 'precise';
  const activeBkashRes = bkashRecipient === 'priyo' ? bkashPriyoRes : bkashNormalRes;

  const tierNote = (res: typeof bkashNormalRes) => {
    if (res.crossedThreshold === 'priyo_25k') return t.sendMoney.crossedPriyo25k;
    if (res.crossedThreshold === 'monthly_50k') return t.sendMoney.crossedMonthly50k;
    switch (res.tier) {
      case 'normal_small_free':
        return t.sendMoney.tierNormalSmallFree;
      case 'priyo_free':
        return t.sendMoney.tierPriyoFree;
      case 'tier1_5bdt':
        return t.sendMoney.tierFiveBdt;
      case 'tier2_10bdt':
        return t.sendMoney.tierTenBdt;
      default:
        return t.sendMoney.flatFeeNote;
    }
  };

  const buildRows = (res: typeof bkashNormalRes): ResultRow[] => {
    const rows: ResultRow[] = [
      {
        label: t.common.recipientReceives,
        poisha: res.recipientReceivesPoisha,
        emphasis: 'positive',
      },
      {
        label: t.common.serviceCharge,
        poisha: res.feePoisha === 0 ? undefined : res.feePoisha,
        text: res.feePoisha === 0 ? t.common.free : undefined,
        emphasis: res.feePoisha === 0 ? 'positive' : 'fee',
      },
      {
        label: mode === 'send_exact' ? t.common.totalRequired : t.common.totalDeduction,
        poisha: res.totalRequiredPoisha,
      },
    ];
    if (mode === 'from_balance') {
      rows.push({
        label: t.common.remainingBalance,
        poisha: res.remainingBalancePoisha,
        emphasis: 'muted',
      });
    }
    return rows;
  };

  const buildCopyText = (title: string, res: typeof bkashNormalRes) => {
    const rec = formatBdtFromPoisha(res.recipientReceivesPoisha, { locale: lang, showDecimals });
    const fee =
      res.feePoisha === 0 ? t.common.free : formatBdtFromPoisha(res.feePoisha, { locale: lang });
    const total = formatBdtFromPoisha(res.totalRequiredPoisha, { locale: lang });
    return `${title}\n${t.common.recipientReceives}: ${rec}\n${t.common.serviceCharge}: ${fee}\n${
      mode === 'send_exact' ? t.common.totalRequired : t.common.totalDeduction
    }: ${total}`;
  };

  const nagadUnavailable = (() => {
    if (nagadRes.available) return undefined;
    if (nagadRes.unavailableReason === 'below_minimum') {
      return `${t.sendMoney.belowMinNote} (${formatBdtFromPoisha(nagadRes.minLimitPoisha ?? 0, {
        locale: lang,
        showDecimals: false,
      })})`;
    }
    if (nagadRes.unavailableReason === 'above_maximum') {
      return `${t.sendMoney.aboveMaxNote} (${formatBdtFromPoisha(nagadRes.maxLimitPoisha ?? 0, {
        locale: lang,
        showDecimals: false,
      })})`;
    }
    if (nagadRes.unavailableReason === 'insufficient_balance') {
      return t.common.insufficientBalance;
    }
    return t.common.enterAmountPrompt;
  })();

  return (
    <div className="space-y-4">
      {/* Provider Selector */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => setProvider('bkash')}
          data-testid="sm-provider-bkash"
          className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-2.5 transition ${
            provider === 'bkash'
              ? 'border-bkash bg-bkash-soft/70 dark:bg-bkash/15'
              : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
          }`}
        >
          <BrandBadge brand="bkash" size="sm" />
          <span className="text-[11px] font-bold text-slate-900 dark:text-white sm:text-xs">
            {t.sendMoney.bkashToBkash}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setProvider('nagad_regular')}
          data-testid="sm-provider-nagad"
          className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-2.5 transition ${
            provider === 'nagad_regular'
              ? 'border-nagad bg-nagad-soft/70 dark:bg-nagad/15'
              : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
          }`}
        >
          <BrandBadge brand="nagad" size="sm" />
          <span className="text-[11px] font-bold text-slate-900 dark:text-white sm:text-xs">
            {t.sendMoney.nagadToNagad}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setProvider('nagad_islamic')}
          data-testid="sm-provider-nagad-islamic"
          className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-2.5 transition ${
            provider === 'nagad_islamic'
              ? 'border-islamic bg-islamic-soft/70 dark:bg-islamic/15'
              : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900'
          }`}
        >
          <BrandBadge brand="nagad-islamic" size="sm" />
          <span className="text-[11px] font-bold text-slate-900 dark:text-white sm:text-xs">
            {t.sendMoney.nagadIslamic}
          </span>
        </button>
      </div>

      {/* Main Input Card */}
      <AmountInputCard
        t={t}
        lang={lang}
        label={mode === 'send_exact' ? t.common.wantToSend : t.common.yourBalance}
        value={amountRaw}
        onChange={setAmountRaw}
        onReset={() => setAmountRaw('')}
        modeLabelA={t.sendMoney.modeSendExact}
        modeLabelB={t.sendMoney.modeFromBalance}
        isModeA={mode === 'send_exact'}
        onSwapMode={() =>
          setMode((prev) => (prev === 'send_exact' ? 'from_balance' : 'send_exact'))
        }
        precision={precision}
        onChangePrecision={onChangePrecision}
        accentClass={
          provider === 'bkash'
            ? 'focus-within:border-bkash'
            : provider === 'nagad_islamic'
              ? 'focus-within:border-islamic'
              : 'focus-within:border-nagad'
        }
        invalid={isInvalid}
      />

      {/* Provider-Specific Controls */}
      {provider === 'bkash' ? (
        <div className="space-y-3">
          {/* Recipient Type Switcher */}
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setBkashRecipient('normal')}
              data-testid="sm-bkash-normal"
              className={`rounded-xl py-2 text-xs font-bold transition sm:text-sm ${
                bkashRecipient === 'normal'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {t.sendMoney.normalNumber}
            </button>
            <button
              type="button"
              onClick={() => setBkashRecipient('priyo')}
              data-testid="sm-bkash-priyo"
              className={`rounded-xl py-2 text-xs font-bold transition sm:text-sm ${
                bkashRecipient === 'priyo'
                  ? 'bg-bkash text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {t.sendMoney.priyoNumber}
            </button>
          </div>

          {/* Monthly Send Money Usage Tracker */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-4">
            <button
              type="button"
              onClick={() => setShowMonthlyInput((v) => !v)}
              data-testid="sm-monthly-toggle"
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                  {t.sendMoney.monthlySendUsed}
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  {t.sendMoney.priyoFreeRemaining}:{' '}
                  {formatBdtFromPoisha(bkashPriyoRes.priyoFreeRemainingPoisha ?? 0, {
                    locale: lang,
                    showDecimals: false,
                  })}
                </span>
              </div>
              {showMonthlyInput ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
              )}
            </button>

            {showMonthlyInput && (
              <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950/60">
                  <span className="mr-2 text-sm font-semibold text-slate-400">
                    {lang === 'bn' ? '৳' : 'BDT'}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    data-testid="sm-monthly-used-input"
                    placeholder="0"
                    value={bkashMonthlyUsedRaw}
                    onChange={(e) => onChangeBkashMonthlyUsed(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none tabular-nums-fintech dark:text-white"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  {t.common.monthlyResetNote}
                </p>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setNagadChannel('app')}
            className={`rounded-xl py-2 text-xs font-bold transition sm:text-sm ${
              nagadChannel === 'app'
                ? provider === 'nagad_islamic'
                  ? 'bg-islamic text-white'
                  : 'bg-nagad text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {t.sendMoney.nagadAppChannel}
          </button>
          <button
            type="button"
            onClick={() => setNagadChannel('ussd')}
            className={`rounded-xl py-2 text-xs font-bold transition sm:text-sm ${
              nagadChannel === 'ussd'
                ? provider === 'nagad_islamic'
                  ? 'bg-islamic text-white'
                  : 'bg-nagad text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {t.sendMoney.nagadUssdChannel}
          </button>
        </div>
      )}

      {/* Results */}
      {amountPoisha <= 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
          {t.common.enterAmountPrompt}
        </div>
      ) : provider === 'bkash' ? (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <ResultCard
            t={t}
            lang={lang}
            testId="card-sm-bkash-active"
            title={
              bkashRecipient === 'priyo'
                ? `${t.sendMoney.bkashToBkash} (${t.sendMoney.priyoNumber})`
                : `${t.sendMoney.bkashToBkash} (${t.sendMoney.normalNumber})`
            }
            badge={t.common.flatCharge}
            isBest={activeBkashRes.available && activeBkashRes.feePoisha === 0}
            primaryLabel={
              mode === 'send_exact' ? t.common.totalRequired : t.common.maxSendable
            }
            primaryPoisha={
              mode === 'send_exact'
                ? activeBkashRes.totalRequiredPoisha
                : activeBkashRes.recipientReceivesPoisha
            }
            showDecimals={showDecimals}
            rows={buildRows(activeBkashRes)}
            unavailableMessage={
              !activeBkashRes.available ? t.common.insufficientBalance : undefined
            }
            note={tierNote(activeBkashRes)}
            noteTone={
              activeBkashRes.crossedThreshold
                ? 'warning'
                : activeBkashRes.feePoisha === 0
                  ? 'success'
                  : 'info'
            }
            copySummaryText={buildCopyText(t.sendMoney.bkashToBkash, activeBkashRes)}
          />

          {/* Side-by-side comparison with the other recipient type */}
          {(() => {
            const otherRes = bkashRecipient === 'priyo' ? bkashNormalRes : bkashPriyoRes;
            const otherTitle =
              bkashRecipient === 'priyo'
                ? `${t.sendMoney.bkashToBkash} (${t.sendMoney.normalNumber})`
                : `${t.sendMoney.bkashToBkash} (${t.sendMoney.priyoNumber})`;
            const savings =
              otherRes.available && activeBkashRes.available && otherRes.feePoisha < activeBkashRes.feePoisha
                ? activeBkashRes.feePoisha - otherRes.feePoisha
                : 0;
            return (
              <ResultCard
                t={t}
                lang={lang}
                testId="card-sm-bkash-compare"
                title={otherTitle}
                badge={t.common.flatCharge}
                isBest={savings > 0}
                savingsPoisha={savings}
                primaryLabel={
                  mode === 'send_exact' ? t.common.totalRequired : t.common.maxSendable
                }
                primaryPoisha={
                  mode === 'send_exact'
                    ? otherRes.totalRequiredPoisha
                    : otherRes.recipientReceivesPoisha
                }
                showDecimals={showDecimals}
                rows={buildRows(otherRes)}
                unavailableMessage={!otherRes.available ? t.common.insufficientBalance : undefined}
                note={tierNote(otherRes)}
                noteTone={otherRes.feePoisha === 0 ? 'success' : 'info'}
                copySummaryText={buildCopyText(otherTitle, otherRes)}
              />
            );
          })()}
        </div>
      ) : (
        <div className="space-y-3">
          <ResultCard
            t={t}
            lang={lang}
            testId="card-sm-nagad"
            title={
              provider === 'nagad_islamic'
                ? `${t.sendMoney.nagadIslamic} (${nagadChannel === 'app' ? t.sendMoney.nagadAppChannel : t.sendMoney.nagadUssdChannel})`
                : `${t.sendMoney.nagadToNagad} (${nagadChannel === 'app' ? t.sendMoney.nagadAppChannel : t.sendMoney.nagadUssdChannel})`
            }
            badge={t.common.flatCharge}
            primaryLabel={
              mode === 'send_exact' ? t.common.totalRequired : t.common.maxSendable
            }
            primaryPoisha={
              mode === 'send_exact'
                ? nagadRes.totalRequiredPoisha
                : nagadRes.recipientReceivesPoisha
            }
            showDecimals={showDecimals}
            rows={buildRows(nagadRes)}
            unavailableMessage={nagadUnavailable}
            note={t.sendMoney.flatFeeNote}
            copySummaryText={buildCopyText(
              provider === 'nagad_islamic' ? t.sendMoney.nagadIslamic : t.sendMoney.nagadToNagad,
              nagadRes
            )}
          />
          {nagadChannel === 'app' && (
            <p className="flex items-start gap-1.5 px-1 text-xs text-slate-500 dark:text-slate-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t.sendMoney.nagadCashbackNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
