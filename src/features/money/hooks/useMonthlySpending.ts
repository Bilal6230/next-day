import { useMemo } from 'react';

import { useExpenses } from '@/features/money/hooks/useExpenses';
import { sumExpensesForMonth } from '@/features/money/utils/spending';
import { getCurrentMonthKey } from '@/features/money/utils/dates';
import { DEFAULT_CURRENCY } from '@/shared/utils/money';

export function useMonthlySpending() {
  const { expenses, isLoading, error, retry } = useExpenses();
  const monthKey = getCurrentMonthKey();
  const totalMinor = useMemo(
    () => sumExpensesForMonth(expenses, monthKey, DEFAULT_CURRENCY),
    [expenses, monthKey],
  );

  return { totalMinor, monthKey, isLoading, error, retry };
}
