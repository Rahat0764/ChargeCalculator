import React, { useState } from 'react';
import { ExternalLink, RotateCcw, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import {
  DEFAULT_RATES,
  RATE_SOURCES,
  RateConfig,
  VERIFIED_DATE_DISPLAY_BN,
  VERIFIED_DATE_DISPLAY_EN,
} from '../config/rates';
import { Language, Translations } from '../i18n/translations';
import { TransactionFeeIcon } from './icons/CustomIcons';

interface SettingsViewProps {
  t: Translations;
  lang: Language;
  rates: RateConfig;
  isCustomized: boolean;
  onUpdateRates: (updater: (draft: RateConfig) => void) => void;
  onResetRates: () => void;
  onClearMonthlyUsage: () => void;
  monthKey: string;
}

interface RateRowProps {
  label: string;
  unit: string;
  value: number;
  defaultValue: number;
  step?: string;
  onChange: (next: number) => void;
  t: Translations;
  lang: Language;
  testId?: string;
}

const RateInputRow: React.FC<RateRowProps> = ({
  label,
  unit,
  value,
  defaultValue,
  step = '0.01',
  onChange,
  t,
  lang,
  testId,
}) => {
  const modified = Math.abs(value - defaultValue) > 0.0001;

  return (
    <div className="flex flex-col justify-between gap-2 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 sm:text-sm">
            {label}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              modified
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {modified ? t.settings.customBadge : t.settings.officialBadge}
          </span>
        </div>
        <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          {unit} · {lang === 'bn' ? 'ডিফল্ট' : 'Default'}: {defaultValue}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <input
          type="number"
          step={step}
          min="0"
          data-testid={testId}
          value={value}
          onChange={(e) => {
            const parsed = Number(e.target.value);
            if (Number.isFinite(parsed) && parsed >= 0) {
              onChange(parsed);
            }
          }}
          className="w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-right text-sm font-bold text-slate-900 outline-none tabular-nums-fintech focus:border-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-emerald-400"
        />
        {modified && (
          <button
            type="button"
            onClick={() => onChange(defaultValue)}
            title={t.common.restoreDefaults}
            aria-label={t.common.restoreDefaults}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export const SettingsView: React.FC<SettingsViewProps> = ({
  t,
  lang,
  rates,
  isCustomized,
  onUpdateRates,
  onResetRates,
  onClearMonthlyUsage,
  monthKey,
}) => {
  const [resetFeedback, setResetFeedback] = useState(false);

  const handleResetAll = () => {
    onResetRates();
    setResetFeedback(true);
    window.setTimeout(() => setResetFeedback(false), 2200);
  };

  const per1k = t.common.perThousand;
  const flatLabel = t.common.flatCharge;
  const bdtUnit = lang === 'bn' ? 'টাকা (BDT)' : 'BDT';

  return (
    <div className="animate-subtle-pop space-y-5">
      {/* Header Banner */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-emerald-400">
              <TransactionFeeIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                {t.settings.title}
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {t.settings.subtitle}
              </p>
              <p className="mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                {t.common.verifiedDate}:{' '}
                {lang === 'bn' ? VERIFIED_DATE_DISPLAY_BN : VERIFIED_DATE_DISPLAY_EN}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAll}
            disabled={!isCustomized}
            data-testid="restore-defaults-btn"
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
              isCustomized
                ? 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800 dark:border-emerald-500 dark:bg-emerald-500 dark:text-slate-950'
                : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-600'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t.settings.resetAll}
          </button>
        </div>

        {resetFeedback && (
          <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            {t.settings.resetSuccess}
          </div>
        )}

        <div className="mt-3.5 flex items-start gap-2 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{t.settings.verifyAppWarning}</span>
        </div>
      </section>

      {/* bKash Editable Rates */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <h3 className="mb-1 text-sm font-bold text-bkash sm:text-base">
          {t.settings.bkashSection}
        </h3>
        <div>
          <RateInputRow
            t={t}
            lang={lang}
            testId="rate-bkash-normal"
            label={lang === 'bn' ? 'সাধারণ এজেন্ট ক্যাশ আউট' : 'Normal Agent Cash Out'}
            unit={per1k}
            value={rates.bkash.cashOut.normalAgentPerThousand}
            defaultValue={DEFAULT_RATES.bkash.cashOut.normalAgentPerThousand}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.bkash.cashOut.normalAgentPerThousand = v;
              })
            }
          />
          <RateInputRow
            t={t}
            lang={lang}
            testId="rate-bkash-priyo"
            label={lang === 'bn' ? 'প্রিয় এজেন্ট ক্যাশ আউট' : 'Priyo Agent Cash Out'}
            unit={per1k}
            value={rates.bkash.cashOut.priyoAgentPerThousand}
            defaultValue={DEFAULT_RATES.bkash.cashOut.priyoAgentPerThousand}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.bkash.cashOut.priyoAgentPerThousand = v;
              })
            }
          />
          <RateInputRow
            t={t}
            lang={lang}
            label={lang === 'bn' ? 'প্রিয় এজেন্ট মাসিক লিমিট' : 'Priyo Monthly Allowance'}
            unit={bdtUnit}
            step="500"
            value={rates.bkash.cashOut.priyoMonthlyAllowanceBdt}
            defaultValue={DEFAULT_RATES.bkash.cashOut.priyoMonthlyAllowanceBdt}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.bkash.cashOut.priyoMonthlyAllowanceBdt = v;
              })
            }
          />
          <RateInputRow
            t={t}
            lang={lang}
            label={lang === 'bn' ? 'সাধারণ এটিএম ক্যাশ আউট' : 'Regular ATM Cash Out'}
            unit={per1k}
            value={rates.bkash.cashOut.regularAtmPerThousand}
            defaultValue={DEFAULT_RATES.bkash.cashOut.regularAtmPerThousand}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.bkash.cashOut.regularAtmPerThousand = v;
              })
            }
          />
          <RateInputRow
            t={t}
            lang={lang}
            label={lang === 'bn' ? 'বৈধ রেমিট্যান্স এটিএম' : 'Eligible Remittance ATM'}
            unit={per1k}
            value={rates.bkash.cashOut.remittanceAtmPerThousand}
            defaultValue={DEFAULT_RATES.bkash.cashOut.remittanceAtmPerThousand}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.bkash.cashOut.remittanceAtmPerThousand = v;
              })
            }
          />
          <RateInputRow
            t={t}
            lang={lang}
            label={lang === 'bn' ? 'এটিএম সর্বনিম্ন / গুণিতক (সর্বনিম্ন)' : 'ATM Minimum Withdrawal'}
            unit={bdtUnit}
            step="500"
            value={rates.bkash.cashOut.atmMinBdt}
            defaultValue={DEFAULT_RATES.bkash.cashOut.atmMinBdt}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.bkash.cashOut.atmMinBdt = v;
              })
            }
          />
          <RateInputRow
            t={t}
            lang={lang}
            label={lang === 'bn' ? 'এটিএম সর্বোচ্চ প্রতি লেনদেন' : 'ATM Max Per Transaction'}
            unit={bdtUnit}
            step="500"
            value={rates.bkash.cashOut.atmMaxPerTxnBdt}
            defaultValue={DEFAULT_RATES.bkash.cashOut.atmMaxPerTxnBdt}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.bkash.cashOut.atmMaxPerTxnBdt = v;
              })
            }
          />
          <RateInputRow
            t={t}
            lang={lang}
            label={lang === 'bn' ? 'সেন্ড মানি স্ল্যাব ১ চার্জ (৫০k পর্যন্ত)' : 'Send Money Tier 1 Fee'}
            unit={flatLabel}
            step="1"
            value={rates.bkash.sendMoney.tier1FeeBdt}
            defaultValue={DEFAULT_RATES.bkash.sendMoney.tier1FeeBdt}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.bkash.sendMoney.tier1FeeBdt = v;
              })
            }
          />
          <RateInputRow
            t={t}
            lang={lang}
            label={lang === 'bn' ? 'সেন্ড মানি স্ল্যাব ২ চার্জ (৫০k+)' : 'Send Money Tier 2 Fee'}
            unit={flatLabel}
            step="1"
            value={rates.bkash.sendMoney.tier2FeeBdt}
            defaultValue={DEFAULT_RATES.bkash.sendMoney.tier2FeeBdt}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.bkash.sendMoney.tier2FeeBdt = v;
              })
            }
          />
        </div>
      </section>

      {/* Nagad Editable Rates */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <h3 className="mb-1 text-sm font-bold text-nagad sm:text-base">
          {t.settings.nagadSection}
        </h3>
        <div>
          <RateInputRow
            t={t}
            lang={lang}
            label={lang === 'bn' ? 'নগদ সাধারণ অ্যাপ ক্যাশ আউট' : 'Nagad Regular App Cash Out'}
            unit={per1k}
            value={rates.nagad.cashOut.regularAppPerThousand}
            defaultValue={DEFAULT_RATES.nagad.cashOut.regularAppPerThousand}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.nagad.cashOut.regularAppPerThousand = v;
              })
            }
          />
          <RateInputRow
            t={t}
            lang={lang}
            label={lang === 'bn' ? 'নগদ সাধারণ ইউএসএসডি ক্যাশ আউট' : 'Nagad Regular USSD Cash Out'}
            unit={per1k}
            value={rates.nagad.cashOut.regularUssdPerThousand}
            defaultValue={DEFAULT_RATES.nagad.cashOut.regularUssdPerThousand}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.nagad.cashOut.regularUssdPerThousand = v;
              })
            }
          />
          <RateInputRow
            t={t}
            lang={lang}
            label={lang === 'bn' ? 'নগদ ইসলামিক অ্যাপ ক্যাশ আউট' : 'Nagad Islamic App Cash Out'}
            unit={per1k}
            value={rates.nagad.cashOut.islamicAppPerThousand}
            defaultValue={DEFAULT_RATES.nagad.cashOut.islamicAppPerThousand}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.nagad.cashOut.islamicAppPerThousand = v;
              })
            }
          />
          <RateInputRow
            t={t}
            lang={lang}
            label={lang === 'bn' ? 'নগদ সেন্ড মানি (সাধারণ অ্যাপ)' : 'Nagad Regular App Send Money'}
            unit={flatLabel}
            step="1"
            value={rates.nagad.sendMoney.regularAppFlatFeeBdt}
            defaultValue={DEFAULT_RATES.nagad.sendMoney.regularAppFlatFeeBdt}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.nagad.sendMoney.regularAppFlatFeeBdt = v;
              })
            }
          />
          <RateInputRow
            t={t}
            lang={lang}
            label={lang === 'bn' ? 'নগদ ইসলামিক সেন্ড মানি' : 'Nagad Islamic Send Money'}
            unit={flatLabel}
            step="1"
            value={rates.nagad.sendMoney.islamicAppFlatFeeBdt}
            defaultValue={DEFAULT_RATES.nagad.sendMoney.islamicAppFlatFeeBdt}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.nagad.sendMoney.islamicAppFlatFeeBdt = v;
              })
            }
          />
        </div>
      </section>

      {/* NPSB & Direct Bank Editable Rates */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <h3 className="mb-1 text-sm font-bold text-npsb dark:text-teal-400 sm:text-base">
          {t.settings.npsbSection}
        </h3>
        <div>
          <RateInputRow
            t={t}
            lang={lang}
            testId="rate-npsb"
            label={lang === 'bn' ? 'এনপিএসবি ট্রান্সফার (০.৮৫%)' : 'NPSB Interoperable Rate'}
            unit={per1k}
            value={rates.npsb.mfsToBankOrMfsPerThousand}
            defaultValue={DEFAULT_RATES.npsb.mfsToBankOrMfsPerThousand}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.npsb.mfsToBankOrMfsPerThousand = v;
              })
            }
          />
          <RateInputRow
            t={t}
            lang={lang}
            label={lang === 'bn' ? 'সরাসরি বিকাশ→ব্যাংক (পার্টনার রেট)' : 'Direct bKash→Bank (Partner)'}
            unit={per1k}
            value={rates.bkash.directBank.partnerPerThousand}
            defaultValue={DEFAULT_RATES.bkash.directBank.partnerPerThousand}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.bkash.directBank.partnerPerThousand = v;
              })
            }
          />
          <RateInputRow
            t={t}
            lang={lang}
            label={lang === 'bn' ? 'সরাসরি বিকাশ→ব্যাংক (স্ট্যান্ডার্ড)' : 'Direct bKash→Bank (Standard)'}
            unit={per1k}
            value={rates.bkash.directBank.standardPerThousand}
            defaultValue={DEFAULT_RATES.bkash.directBank.standardPerThousand}
            onChange={(v) =>
              onUpdateRates((d) => {
                d.bkash.directBank.standardPerThousand = v;
              })
            }
          />
        </div>
      </section>

      {/* Monthly Trackers Reset */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t.settings.monthlyTrackersTitle} ({monthKey})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.common.monthlyResetNote}</p>
        </div>
        <button
          type="button"
          onClick={onClearMonthlyUsage}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t.settings.clearMonthlyUsage}
        </button>
      </section>

      {/* Verified Sources List */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white sm:text-base">
          {t.settings.sourcesTitle}
        </h3>
        <div className="space-y-2.5">
          {RATE_SOURCES.map((src) => (
            <div
              key={src.id}
              className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {lang === 'bn' ? src.labelBn : src.labelEn}
                  </div>
                  {(src.noteEn || src.noteBn) && (
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                      {lang === 'bn' ? src.noteBn : src.noteEn}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    src.status === 'verified'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
                  }`}
                >
                  {src.status === 'verified'
                    ? t.settings.verifiedBadge
                    : t.settings.configurableBadge}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <a
                  href={src.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-sky-700 hover:underline dark:text-sky-400"
                >
                  {src.sourceName}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <span>
                  {t.common.verifiedDate}: {src.verifiedDate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
