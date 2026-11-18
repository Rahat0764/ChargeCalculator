import { useCallback, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface MonthlyUsageRecord {
  monthKey: string; // YYYY-MM
  priyoAgentCashOutBdt: string;
  bkashSendMoneyBdt: string;
}

function getCurrentMonthKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

const STORAGE_KEY = 'cc_monthly_usage_v1';

export function useMonthlyUsage() {
  const currentMonth = getCurrentMonthKey();

  const [record, setRecord] = useLocalStorage<MonthlyUsageRecord>(STORAGE_KEY, {
    monthKey: currentMonth,
    priyoAgentCashOutBdt: '',
    bkashSendMoneyBdt: '',
  });

  // Automatically reset when the calendar month rolls over
  useEffect(() => {
    if (record.monthKey !== currentMonth) {
      setRecord({
        monthKey: currentMonth,
        priyoAgentCashOutBdt: '',
        bkashSendMoneyBdt: '',
      });
    }
  }, [record.monthKey, currentMonth, setRecord]);

  const setPriyoAgentUsed = useCallback(
    (val: string) => {
      setRecord((prev) => ({
        ...prev,
        monthKey: currentMonth,
        priyoAgentCashOutBdt: val,
      }));
    },
    [currentMonth, setRecord]
  );

  const setBkashSendMoneyUsed = useCallback(
    (val: string) => {
      setRecord((prev) => ({
        ...prev,
        monthKey: currentMonth,
        bkashSendMoneyBdt: val,
      }));
    },
    [currentMonth, setRecord]
  );

  const clearMonthlyUsage = useCallback(() => {
    setRecord({
      monthKey: currentMonth,
      priyoAgentCashOutBdt: '',
      bkashSendMoneyBdt: '',
    });
  }, [currentMonth, setRecord]);

  return {
    monthKey: currentMonth,
    priyoAgentUsed: record.monthKey === currentMonth ? record.priyoAgentCashOutBdt : '',
    bkashSendMoneyUsed: record.monthKey === currentMonth ? record.bkashSendMoneyBdt : '',
    setPriyoAgentUsed,
    setBkashSendMoneyUsed,
    clearMonthlyUsage,
  };
}
