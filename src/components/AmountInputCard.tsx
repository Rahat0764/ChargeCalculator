import React from 'react';
import { ArrowLeftRight, RotateCcw, X } from 'lucide-react';
import { Language, Translations } from '../i18n/translations';
import { PrecisionMode, toBengaliDigits } from '../engine/money';
import { WalletIcon } from './icons/CustomIcons';

const QUICK_AMOUNTS = [100, 500, 1000, 3000, 5000, 10000];

interface AmountInputCardProps {
  t: Translations;
  lang: Language;
  label: string;
  value: string;
  onChange: (val: string) => void;
  onReset: () => void;
  modeLabelA: string;
  modeLabelB: string;
  isModeA: boolean;
  onSwapMode: () => void;
  precision: PrecisionMode;
  onChangePrecision: (p: PrecisionMode) => void;
  showPrecisionToggle?: boolean;
  accentClass?: string;
  invalid?: boolean;
  optionalBalance?: {
    value: string;
    onChange: (val: string) => void;
  };
}

export const AmountInputCard: React.FC<AmountInputCardProps> = ({
  t,
  lang,
  label,
  value,
  onChange,
  onReset,
  modeLabelA,
  modeLabelB,
  isModeA,
  onSwapMode,
  precision,
  onChangePrecision,
  showPrecisionToggle = true,
  accentClass = 'focus-within:border-slate-900 dark:focus-within:border-emerald-400',
  invalid = false,
  optionalBalance,
}) => {
  const formatChip = (amt: number) => {
    const s = amt.toLocaleString('en-IN');
    return lang === 'bn' ? `৳${toBengaliDigits(s)}` : `৳${s}`;
  };

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      {/* Mode Switch Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div
          className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80"
          role="group"
          aria-label={t.common.swapMode}
        >
          <button
            type="button"
            onClick={() => !isModeA && onSwapMode()}
            data-testid="mode-a-btn"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
              isModeA
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {modeLabelA}
          </button>
          <button
            type="button"
            onClick={() => isModeA && onSwapMode()}
            data-testid="mode-b-btn"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
              !isModeA
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {modeLabelB}
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onSwapMode}
            title={t.common.swapMode}
            aria-label={t.common.swapMode}
            data-testid="swap-mode-btn"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onReset}
            title={t.common.reset}
            aria-label={t.common.reset}
            data-testid="reset-btn"
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden xs:inline sm:inline">{t.common.reset}</span>
          </button>
        </div>
      </div>

      {/* Main Prominent Amount Input */}
      <div className="mb-1 flex items-center justify-between">
        <label
          htmlFor="primary-amount-input"
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <WalletIcon className="h-4 w-4" />
          {label}
        </label>

        {showPrecisionToggle && (
          <div className="inline-flex items-center rounded-lg bg-slate-100 p-0.5 text-[11px] font-semibold dark:bg-slate-800">
            <button
              type="button"
              onClick={() => onChangePrecision('whole')}
              data-testid="precision-whole"
              className={`rounded-md px-2 py-0.5 transition ${
                precision === 'whole'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t.common.wholeTaka}
            </button>
            <button
              type="button"
              onClick={() => onChangePrecision('precise')}
              data-testid="precision-precise"
              className={`rounded-md px-2 py-0.5 transition ${
                precision === 'precise'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t.common.preciseMode}
            </button>
          </div>
        )}
      </div>

      <div
        className={`relative flex items-center rounded-xl border-2 bg-slate-50/70 px-3.5 py-2.5 transition dark:bg-slate-950/60 ${
          invalid
            ? 'border-rose-400 dark:border-rose-500'
            : `border-slate-200 dark:border-slate-700/80 ${accentClass}`
        }`}
      >
        <span className="mr-2 select-none text-lg font-bold text-slate-400 dark:text-slate-500 sm:text-xl">
          {lang === 'bn' ? '৳' : 'BDT'}
        </span>
        <input
          id="primary-amount-input"
          data-testid="amount-input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent text-2xl font-bold tracking-tight text-slate-900 outline-none placeholder:text-slate-300 tabular-nums-fintech dark:text-white dark:placeholder:text-slate-700 sm:text-3xl"
        />
        {value.trim() !== '' && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label={t.common.clear}
            data-testid="clear-input-btn"
            className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200/80 text-slate-600 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {invalid && (
        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          {t.common.invalidInput}
        </p>
      )}

      {/* Quick Amount Chips */}
      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Quick amounts">
        {QUICK_AMOUNTS.map((amt) => {
          const active = value.replace(/[,\s]/g, '') === String(amt);
          return (
            <button
              key={amt}
              type="button"
              onClick={() => onChange(String(amt))}
              data-testid={`chip-${amt}`}
              className={`rounded-lg border px-2.5 py-1 text-xs font-semibold tabular-nums-fintech transition active:scale-[0.97] ${
                active
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-slate-950'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700/80 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {formatChip(amt)}
            </button>
          );
        })}
      </div>

      {/* Optional Balance Affordability Check in Desired Mode */}
      {optionalBalance && (
        <div className="mt-4 border-t border-slate-100 pt-3.5 dark:border-slate-800">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <label
              htmlFor="optional-balance-input"
              className="text-xs font-semibold text-slate-600 dark:text-slate-300"
            >
              {t.common.optionalBalance}
            </label>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {t.common.optionalBalanceHint}
            </span>
          </div>
          <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700/80 dark:bg-slate-950/60">
            <span className="mr-2 text-sm font-semibold text-slate-400">
              {lang === 'bn' ? '৳' : 'BDT'}
            </span>
            <input
              id="optional-balance-input"
              data-testid="optional-balance-input"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0"
              value={optionalBalance.value}
              onChange={(e) => optionalBalance.onChange(e.target.value)}
              className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-900 outline-none tabular-nums-fintech dark:text-white"
            />
            {optionalBalance.value.trim() !== '' && (
              <button
                type="button"
                onClick={() => optionalBalance.onChange('')}
                aria-label={t.common.clear}
                className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
