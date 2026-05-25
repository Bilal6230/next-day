import { Timestamp } from 'firebase/firestore';

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateKey(): string {
  return getLocalDateKey(new Date());
}

export function getCurrentMonthKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function dateAtLocalMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDaysToDate(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return dateAtLocalMidnight(next);
}

export function getDateKeyAfterDays(from: Date, days: number): string {
  return getLocalDateKey(addDaysToDate(from, days));
}

export function dueDateToFields(dueDate: Date | null): {
  dueDate: Timestamp | null;
  dueDateKey: string | null;
} {
  if (!dueDate) {
    return { dueDate: null, dueDateKey: null };
  }
  const normalized = dateAtLocalMidnight(dueDate);
  return {
    dueDate: Timestamp.fromDate(normalized),
    dueDateKey: getLocalDateKey(normalized),
  };
}

export function spentDateToFields(spentDate: Date): {
  spentDate: Timestamp;
  spentDateKey: string;
} {
  const normalized = dateAtLocalMidnight(spentDate);
  return {
    spentDate: Timestamp.fromDate(normalized),
    spentDateKey: getLocalDateKey(normalized),
  };
}

export function timestampToDate(timestamp: Timestamp | null): Date | null {
  if (!timestamp) return null;
  return timestamp.toDate();
}

export function formatSpentDateLabel(spentDateKey: string): string {
  const todayKey = getTodayDateKey();
  if (spentDateKey === todayKey) return 'Today';
  const [year, month, day] = spentDateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function getTomorrowDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return dateAtLocalMidnight(date);
}
