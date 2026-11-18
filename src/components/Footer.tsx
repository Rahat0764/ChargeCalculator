import React from 'react';
import { ShieldCheck, WifiOff } from 'lucide-react';
import { VERIFIED_DATE_DISPLAY_BN, VERIFIED_DATE_DISPLAY_EN } from '../config/rates';
import { Language, Translations } from '../i18n/translations';

interface FooterProps {
  t: Translations;
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ t, lang }) => {
  return (
    <footer className="mt-8 border-t border-slate-200/80 bg-white/60 py-6 dark:border-slate-800/80 dark:bg-slate-950/60">
      <div className="mx-auto max-w-4xl space-y-3 px-4 text-center sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            {lang === 'bn' ? '১০০% লোকাল ও প্রাইভেট' : '100% Local & Private'}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <WifiOff className="h-3.5 w-3.5" />
            {t.footer.offlineReady}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {t.common.verifiedDate}:{' '}
            {lang === 'bn' ? VERIFIED_DATE_DISPLAY_BN : VERIFIED_DATE_DISPLAY_EN}
          </span>
        </div>

        <p className="mx-auto max-w-2xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {t.footer.privacy}
        </p>
        <p className="mx-auto max-w-2xl text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
          {t.footer.disclaimer}
        </p>
      </div>
    </footer>
  );
};
