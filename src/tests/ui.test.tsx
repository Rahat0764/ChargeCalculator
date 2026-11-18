import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { App } from '../App';
import { CashOutSection } from '../components/CashOutSection';
import { SendMoneySection } from '../components/SendMoneySection';
import { NpsbSection } from '../components/NpsbSection';
import { SettingsView } from '../components/SettingsView';
import { DEFAULT_RATES } from '../config/rates';
import { TRANSLATIONS } from '../i18n/translations';

const noop = () => {};

describe('UI Component Render & Asset Integrity Verification', () => {
  it('renders App in default Bangla with BDT 510 Normal (500) & Priyo (502) outputs and zero NaN', () => {
    const html = renderToStaticMarkup(React.createElement(App));
    expect(html).toContain('ChargeCalculator');
    expect(html).toContain('আপনার ব্যালান্স');
    expect(html).toContain('প্রিয় এজেন্ট');
    expect(html).toContain('সাধারণ এজেন্ট');
    expect(html).toContain('সবচেয়ে সাশ্রয়ী');
    expect(html).toContain('৳৫০০');
    expect(html).toContain('৳৫০২');
    expect(html).not.toContain('NaN');
    expect(html).not.toContain('Infinity');
  });

  it('renders CashOut, SendMoney, NPSB, and Settings cleanly in both Bangla and English', () => {
    for (const lang of ['bn', 'en'] as const) {
      const t = TRANSLATIONS[lang];

      const cashOutHtml = renderToStaticMarkup(
        React.createElement(CashOutSection, {
          t,
          lang,
          rates: DEFAULT_RATES,
          precision: 'whole',
          onChangePrecision: noop,
          priyoMonthlyUsedRaw: '',
          onChangePriyoMonthlyUsed: noop,
        })
      );
      expect(cashOutHtml).not.toContain('NaN');
      expect(cashOutHtml).not.toContain('Infinity');
      if (lang === 'en') {
        expect(cashOutHtml).toContain('BDT 500');
        expect(cashOutHtml).toContain('BDT 502');
        expect(cashOutHtml).toContain('13.95/1,000');
        expect(cashOutHtml).not.toContain('১০০০');
      }

      const sendMoneyHtml = renderToStaticMarkup(
        React.createElement(SendMoneySection, {
          t,
          lang,
          rates: DEFAULT_RATES,
          precision: 'whole',
          onChangePrecision: noop,
          bkashMonthlyUsedRaw: '',
          onChangeBkashMonthlyUsed: noop,
        })
      );
      expect(sendMoneyHtml).not.toContain('NaN');
      if (lang === 'en') {
        expect(sendMoneyHtml).toContain('BDT 505');
      }

      const npsbHtml = renderToStaticMarkup(
        React.createElement(NpsbSection, {
          t,
          lang,
          rates: DEFAULT_RATES,
          precision: 'whole',
          onChangePrecision: noop,
        })
      );
      expect(npsbHtml).not.toContain('NaN');
      if (lang === 'en') {
        expect(npsbHtml).toContain('BDT 5,042.50');
        expect(npsbHtml).toContain('8.50');
      }

      const settingsHtml = renderToStaticMarkup(
        React.createElement(SettingsView, {
          t,
          lang,
          rates: DEFAULT_RATES,
          isCustomized: false,
          onUpdateRates: noop,
          onResetRates: noop,
          onClearMonthlyUsage: noop,
          monthKey: '2026-11',
        })
      );
      expect(settingsHtml).not.toContain('NaN');
      expect(settingsHtml).toContain('https://www.bkash.com/en/products-services/cashout');
      expect(settingsHtml).toContain('https://nagad.com.bd/en/limit-charges/');
      expect(settingsHtml).toContain('https://www.bb.org.bd/');
    }
  });

  it('references only local static brand assets that exist in public/brands/', () => {
    const html = [
      renderToStaticMarkup(
        React.createElement(CashOutSection, {
          t: TRANSLATIONS.en,
          lang: 'en',
          rates: DEFAULT_RATES,
          precision: 'whole',
          onChangePrecision: noop,
          priyoMonthlyUsedRaw: '',
          onChangePriyoMonthlyUsed: noop,
        })
      ),
      renderToStaticMarkup(
        React.createElement(SendMoneySection, {
          t: TRANSLATIONS.en,
          lang: 'en',
          rates: DEFAULT_RATES,
          precision: 'whole',
          onChangePrecision: noop,
          bkashMonthlyUsedRaw: '',
          onChangeBkashMonthlyUsed: noop,
        })
      ),
      renderToStaticMarkup(
        React.createElement(NpsbSection, {
          t: TRANSLATIONS.en,
          lang: 'en',
          rates: DEFAULT_RATES,
          precision: 'whole',
          onChangePrecision: noop,
        })
      ),
    ].join('\n');

    const allowedLocalBrands = new Set([
      '/brands/bkash.svg',
      '/brands/nagad.svg',
      '/brands/nagad-islamic.svg',
      '/brands/rocket.svg',
      '/brands/bank.svg',
      '/brands/npsb.svg',
    ]);
    const matches = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
    expect(matches.length).toBeGreaterThan(0);
    for (const src of matches) {
      expect(src.startsWith('http')).toBe(false);
      expect(allowedLocalBrands.has(src)).toBe(true);
    }
  });
});
