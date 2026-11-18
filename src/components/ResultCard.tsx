import React, { useState } from 'react';
import { Check, Copy, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Language, Translations } from '../i18n/translations';
import { formatBdtFromPoisha, toBengaliDigits } from '../engine/money';
import { AnimatedAmount } from './AnimatedAmount';

export interface ResultRow {
  label: string;
  poisha?: number;
  text?: string;
  emphasis?: 'default' | 'muted' | 'fee' | 'positive' | 'warning';
}

interface ResultCardProps {
  t: Translations;
  lang: Language;
  title: string;
  subtitle?: string;
  badge?: string;
  isBest?: boolean;
  savingsPoisha?: number;
  accentBorderClass?: string;
  primaryLabel: string;
  primaryPoisha: number;
  showDecimals: boolean;
  rows: ResultRow[];
  note?: string;
  noteTone?: 'info' | 'warning' | 'success';
  unavailableMessage?: string;
  affordable?: boolean;
  shortfallPoisha?: number;
  copySummaryText?: string;
  testId?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  t,
  lang,
  title,
  subtitle,
  badge,
  isBest = false,
  savingsPoisha = 0,
  accentBorderClass = 'border-slate-200 dark:border-slate-800',
  primaryLabel,
  primaryPoisha,
  showDecimals,
  rows,
  note,
  noteTone = 'info',
  unavailableMessage,
  affordable,
  shortfallPoisha = 0,
  copySummaryText,
  testId,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copySummaryText) return;
    try {
      await navigator.clipboard.writeText(copySummaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback copy for older mobile webviews
      const ta = document.createElement('textarea');
      ta.value = copySummaryText;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  const noteStyles =
    noteTone === 'warning'
      ? 'border-amber-200/80 bg-amber-50/80 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-200'
      : noteTone === 'success'
        ? 'border-emerald-200/80 bg-emerald-50/80 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200'
        : 'border-slate-200/80 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300';

  return (
    <article
      data-testid={testId}
      className={`animate-subtle-pop flex flex-col justify-between rounded-2xl border bg-white p-4 shadow-soft transition dark:bg-slate-900 sm:p-5 ${
        isBest
          ? 'border-emerald-500/80 ring-1 ring-emerald-500/20 dark:border-emerald-500/60'
          : accentBorderClass
      }`}
    >
      <div>
        {/* Card Header */}
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white sm:text-base">
                {title}
              </h3>
              {isBest && !unavailableMessage && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                  <Sparkles className="h-3 w-3" />
                  {t.common.bestValue}
                </span>
              )}
              {badge && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            )}
          </div>

          {copySummaryText && !unavailableMessage && (
            <button
              type="button"
              onClick={handleCopy}
              aria-label={t.common.copy}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300">{t.common.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{t.common.copy}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Unavailable State */}
        {unavailableMessage ? (
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/70 p-3.5 text-xs leading-relaxed text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{unavailableMessage}</span>
            </div>
          </div>
        ) : (
          <>
            {/* Prominent Primary Metric */}
            <div className="mb-3.5 rounded-xl bg-slate-50/90 px-3.5 py-3 dark:bg-slate-950/70">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {primaryLabel}
                </span>
                {savingsPoisha > 0 && (
                  <span className="rounded-md bg-emerald-100/90 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                    {t.common.youSave}: {formatBdtFromPoisha(savingsPoisha, { locale: lang })}
                  </span>
                )}
              </div>
              <div className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-[26px]">
                <AnimatedAmount
                  poisha={primaryPoisha}
                  locale={lang}
                  showDecimals={showDecimals}
                />
              </div>
            </div>

            {/* Breakdown Rows */}
            <dl className="space-y-2 text-xs sm:text-sm">
              {rows.map((row, idx) => {
                const valueClass =
                  row.emphasis === 'fee'
                    ? 'font-semibold text-rose-600 dark:text-rose-400'
                    : row.emphasis === 'positive'
                      ? 'font-semibold text-emerald-700 dark:text-emerald-400'
                      : row.emphasis === 'warning'
                        ? 'font-semibold text-amber-700 dark:text-amber-400'
                        : row.emphasis === 'muted'
                          ? 'font-medium text-slate-500 dark:text-slate-400'
                          : 'font-semibold text-slate-900 dark:text-slate-100';

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0 dark:border-slate-800/80"
                  >
                    <dt className="text-slate-600 dark:text-slate-400">{row.label}</dt>
                    <dd className={`text-right tabular-nums-fintech ${valueClass}`}>
                      {row.poisha !== undefined
                        ? formatBdtFromPoisha(row.poisha, { locale: lang })
                        : lang === 'bn' && row.text
                          ? toBengaliDigits(row.text)
                          : row.text}
                    </dd>
                  </div>
                );
              })}
            </dl>

            {/* Optional Balance Affordability Banner */}
            {affordable !== undefined && (
              <div
                className={`mt-3 flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
                  affordable
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {affordable ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  {affordable ? t.common.affordable : t.common.insufficientBalance}
                </span>
                {!affordable && shortfallPoisha > 0 && (
                  <span className="tabular-nums-fintech">
                    {t.common.shortBy}: {formatBdtFromPoisha(shortfallPoisha, { locale: lang })}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Contextual Explanation Note */}
      {note && (
        <div className={`mt-3.5 rounded-xl border px-3 py-2.5 text-xs leading-relaxed ${noteStyles}`}>
          {note}
        </div>
      )}
    </article>
  );
};
