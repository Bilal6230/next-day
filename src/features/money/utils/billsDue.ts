import { BILLS_DUE_WINDOW_DAYS } from '@/features/money/constants';
import type { Bill } from '@/features/money/types';
import {
  getCurrentMonthKey,
  getDateKeyAfterDays,
  getLocalDateKey,
  getTodayDateKey,
} from '@/features/money/utils/dates';

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function dueDateKeyForMonth(year: number, monthIndex: number, day: number): string {
  const clampedDay = Math.min(day, daysInMonth(year, monthIndex));
  const date = new Date(year, monthIndex, clampedDay);
  return getLocalDateKey(date);
}

export function isBillPaidForCurrentPeriod(bill: Bill, today = new Date()): boolean {
  if (bill.repeatType === 'monthly') {
    return bill.paidForMonthKey === getCurrentMonthKey(today);
  }
  return bill.paidAt != null;
}

export function getNextBillDueDateKey(
  bill: Bill,
  from: Date = new Date(),
): string | null {
  if (bill.status !== 'active') return null;

  const todayKey = getTodayDateKey();

  if (bill.repeatType === 'none') {
    if (!bill.dueDateKey) return null;
    if (isBillPaidForCurrentPeriod(bill, from)) return null;
    return bill.dueDateKey;
  }

  if (bill.dueDayOfMonth == null) return null;

  const year = from.getFullYear();
  const monthIndex = from.getMonth();
  const thisMonthKey = dueDateKeyForMonth(year, monthIndex, bill.dueDayOfMonth);

  if (
    thisMonthKey >= todayKey &&
    !isBillPaidForCurrentPeriod(bill, from)
  ) {
    return thisMonthKey;
  }

  const nextMonthIndex = monthIndex + 1;
  const nextYear = nextMonthIndex > 11 ? year + 1 : year;
  const normalizedMonth = nextMonthIndex % 12;
  return dueDateKeyForMonth(nextYear, normalizedMonth, bill.dueDayOfMonth);
}

export function isBillDueWithinWindow(
  bill: Bill,
  windowDays: number = BILLS_DUE_WINDOW_DAYS,
  from: Date = new Date(),
): boolean {
  if (bill.status !== 'active' || isBillPaidForCurrentPeriod(bill, from)) {
    return false;
  }

  const dueKey = getNextBillDueDateKey(bill, from);
  if (!dueKey) return false;

  const todayKey = getTodayDateKey();
  const endKey = getDateKeyAfterDays(from, windowDays);
  return dueKey >= todayKey && dueKey <= endKey;
}

export function isBillOverdue(bill: Bill, from: Date = new Date()): boolean {
  const dueKey = getNextBillDueDateKey(bill, from);
  if (!dueKey) return false;
  return dueKey < getTodayDateKey();
}

export function formatBillDueLabel(bill: Bill, from: Date = new Date()): string {
  const dueKey = getNextBillDueDateKey(bill, from);
  if (!dueKey) return 'No due date';
  const todayKey = getTodayDateKey();
  if (dueKey < todayKey) return 'Overdue';
  if (dueKey === todayKey) return 'Due today';
  const endKey = getDateKeyAfterDays(from, 1);
  if (dueKey === endKey) return 'Due tomorrow';
  const [year, month, day] = dueKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function filterBillsDueSoon(
  bills: Bill[],
  windowDays: number = BILLS_DUE_WINDOW_DAYS,
): Bill[] {
  return bills
    .filter((bill) => isBillDueWithinWindow(bill, windowDays))
    .sort((a, b) => {
      const aKey = getNextBillDueDateKey(a) ?? '';
      const bKey = getNextBillDueDateKey(b) ?? '';
      return aKey.localeCompare(bKey);
    });
}
