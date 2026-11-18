import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Language, Translations } from '../i18n/translations';
import { Theme } from '../hooks/useTheme';
import { CalculatorIcon, SettingsIcon } from './icons/CustomIcons';

interface HeaderProps {
  t: Translations;
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  hasCustomRates: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  t,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  isSettingsOpen,
  onToggleSettings,
  hasCustomRates,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-3.5 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-emerald-400 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-400">
            <CalculatorIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white sm:text-lg">
              {t.appName}
            </h1>
            <p className="hidden truncate text-xs text-slate-500 dark:text-slate-400 sm:block">
              {t.appTagline}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onToggleLang}
            aria-label={lang === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
            data-testid="lang-toggle"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 active:scale-[0.98] dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {lang === 'bn' ? 'EN' : 'বাংলা'}
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t.common.themeLight : t.common.themeDark}
            data-testid="theme-toggle"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 active:scale-[0.98] dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onToggleSettings}
            aria-label={t.tabs.settings}
            data-testid="settings-toggle"
            className={`relative inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition active:scale-[0.98] ${
              isSettingsOpen
                ? 'border-slate-900 bg-slate-900 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-slate-950'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.tabs.settings}</span>
            {hasCustomRates && (
              <span
                className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-950"
                title={t.common.customized}
              />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
