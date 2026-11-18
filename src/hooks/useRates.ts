import { useMemo, useCallback } from 'react';
import { DEFAULT_RATES, RateConfig, cloneRates } from '../config/rates';
import { useLocalStorage } from './useLocalStorage';

const RATES_STORAGE_KEY = 'cc_custom_rates_v1';

function deepMergeRates(defaults: RateConfig, overrides: Partial<RateConfig>): RateConfig {
  const base = cloneRates(defaults);
  if (!overrides || typeof overrides !== 'object') return base;
  if (overrides.bkash) {
    if (overrides.bkash.cashOut) Object.assign(base.bkash.cashOut, overrides.bkash.cashOut);
    if (overrides.bkash.sendMoney) Object.assign(base.bkash.sendMoney, overrides.bkash.sendMoney);
    if (overrides.bkash.directBank) Object.assign(base.bkash.directBank, overrides.bkash.directBank);
  }
  if (overrides.nagad) {
    if (overrides.nagad.cashOut) Object.assign(base.nagad.cashOut, overrides.nagad.cashOut);
    if (overrides.nagad.sendMoney) Object.assign(base.nagad.sendMoney, overrides.nagad.sendMoney);
  }
  if (overrides.npsb) {
    Object.assign(base.npsb, overrides.npsb);
  }
  return base;
}

export function useRates() {
  const [savedOverrides, setSavedOverrides] = useLocalStorage<Partial<RateConfig>>(
    RATES_STORAGE_KEY,
    {}
  );

  const rates = useMemo(() => deepMergeRates(DEFAULT_RATES, savedOverrides), [savedOverrides]);

  const isCustomized = useMemo(() => {
    return JSON.stringify(rates) !== JSON.stringify(DEFAULT_RATES);
  }, [rates]);

  const updateRates = useCallback(
    (updater: (draft: RateConfig) => void) => {
      setSavedOverrides((prev) => {
        const merged = deepMergeRates(DEFAULT_RATES, prev);
        updater(merged);
        return merged;
      });
    },
    [setSavedOverrides]
  );

  const resetRates = useCallback(() => {
    setSavedOverrides({});
  }, [setSavedOverrides]);

  return { rates, isCustomized, updateRates, resetRates };
}
