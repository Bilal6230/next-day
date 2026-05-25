import type { Expense } from '@/features/money/types';
import { getCurrentMonthKey } from '@/features/money/utils/dates';
import { DEFAULT_CURRENCY } from '@/shared/utils/money';

export function sumExpensesForMonth(
  expenses: Expense[],
  monthKey: string = getCurrentMonthKey(),
  currency: string = DEFAULT_CURRENCY,
): number {
  return expenses
    .filter(
      (expense) =>
        expense.currency === currency &&
        expense.spentDateKey.startsWith(monthKey),
    )
    .reduce((total, expense) => total + expense.amountMinor, 0);
}
