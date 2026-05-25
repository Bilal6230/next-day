import type { ExpenseCategory } from '@/features/money/types';
import { DEFAULT_CURRENCY } from '@/shared/utils/money';

export { DEFAULT_CURRENCY };

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Bills',
  'Shopping',
  'Family',
  'Health',
  'Learning',
  'Other',
];

export const BILLS_DUE_WINDOW_DAYS = 7;
export const RECENT_EXPENSES_LIMIT = 8;
export const TODAY_BILLS_LIMIT = 3;
