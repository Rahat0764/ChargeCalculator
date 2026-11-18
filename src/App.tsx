import React, { useEffect, useState } from 'react';
import { Language, TRANSLATIONS } from './i18n/translations';
import { PrecisionMode } from './engine';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { useRates } from './hooks/useRates';
import { useMonthlyUsage } from './hooks/useMonthlyUsage';
import { Header } from './components/Header';
import { CashOutSection } from './components/CashOutSection';
import { SendMoneySection } from './components/SendMoneySection';
import { NpsbSection } from './components/NpsbSection';
import { SettingsView } from './components/SettingsView';
import { Footer } from './components/Footer';
import { CashOutIcon, NpsbIcon, SendMoneyIcon } from './components/icons/CustomIcons';

type MainTab = 'cash_out' | 'send_money' | 'npsb';

export const App: React.FC = () => {
  const [lang, setLang] = useLocalStorage<Language>('cc_lang', 'bn');
  const [precision, setPrecision] = useLocalStorage<PrecisionMode>('cc_precision', 'whole');
  const [activeTab, setActiveTab] = useState<MainTab>('cash_out');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const { theme, toggleTheme } = useTheme();
  const { rates, isCustomized, updateRates, resetRates } = useRates();
  const {
    monthKey,
    priyoAgentUsed,
    bkashSendMoneyUsed,
    setPriyoAgentUsed,
    setBkashSendMoneyUsed,
    clearMonthlyUsage,
  } = useMonthlyUsage();

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const handleSelectTab = (tab: MainTab) => {
    setIsSettingsOpen(false);
    setActiveTab(tab);
  };

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header
        t={t}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'bn' ? 'en' : 'bn'))}
        theme={theme}
        onToggleTheme={toggleTheme}
        isSettingsOpen={isSettingsOpen}
        onToggleSettings={() => setIsSettingsOpen((v) => !v)}
        hasCustomRates={isCustomized}
      />

      <main className="mx-auto w-full max-w-4xl flex-1 px-3.5 pt-4 sm:px-6 sm:pt-6">
        {/* Primary Segmented Navigation */}
        <nav
          aria-label="Calculator Sections"
          className="mb-4 grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:mb-5"
        >
          <button
            type="button"
            onClick={() => handleSelectTab('cash_out')}
            data-testid="tab-cash-out"
            className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-bold transition sm:gap-2 sm:text-sm ${
              !isSettingsOpen && activeTab === 'cash_out'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <CashOutIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{t.tabs.cashOut}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('send_money')}
            data-testid="tab-send-money"
            className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-bold transition sm:gap-2 sm:text-sm ${
              !isSettingsOpen && activeTab === 'send_money'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <SendMoneyIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{t.tabs.sendMoney}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectTab('npsb')}
            data-testid="tab-npsb"
            className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-bold transition sm:gap-2 sm:text-sm ${
              !isSettingsOpen && activeTab === 'npsb'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <NpsbIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{t.tabs.npsb}</span>
          </button>
        </nav>

        {/* Active Section */}
        {isSettingsOpen ? (
          <SettingsView
            t={t}
            lang={lang}
            rates={rates}
            isCustomized={isCustomized}
            onUpdateRates={updateRates}
            onResetRates={resetRates}
            onClearMonthlyUsage={clearMonthlyUsage}
            monthKey={monthKey}
          />
        ) : activeTab === 'cash_out' ? (
          <CashOutSection
            t={t}
            lang={lang}
            rates={rates}
            precision={precision}
            onChangePrecision={setPrecision}
            priyoMonthlyUsedRaw={priyoAgentUsed}
            onChangePriyoMonthlyUsed={setPriyoAgentUsed}
          />
        ) : activeTab === 'send_money' ? (
          <SendMoneySection
            t={t}
            lang={lang}
            rates={rates}
            precision={precision}
            onChangePrecision={setPrecision}
            bkashMonthlyUsedRaw={bkashSendMoneyUsed}
            onChangeBkashMonthlyUsed={setBkashSendMoneyUsed}
          />
        ) : (
          <NpsbSection
            t={t}
            lang={lang}
            rates={rates}
            precision={precision}
            onChangePrecision={setPrecision}
          />
        )}
      </main>

      <Footer t={t} lang={lang} />
    </div>
  );
};

export default App;
