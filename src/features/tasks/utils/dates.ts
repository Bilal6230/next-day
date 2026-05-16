import { Timestamp } from 'firebase/firestore';

import type { Task } from '@/features/tasks/types';

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateKey(): string {
  return getLocalDateKey(new Date());
}

export function getTomorrowDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function dateAtLocalMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
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

export function timestampToDate(timestamp: Timestamp | null): Date | null {
  if (!timestamp) return null;
  return timestamp.toDate();
}

export function formatDueDateLabel(
  dueDateKey: string | null,
  options?: { overdue?: boolean },
): string {
  if (!dueDateKey) return 'No due date';
  const todayKey = getTodayDateKey();
  if (dueDateKey === todayKey) return 'Due today';
  if (options?.overdue) return 'Overdue';
  const tomorrowKey = getLocalDateKey(getTomorrowDate());
  if (dueDateKey === tomorrowKey) return 'Due tomorrow';
  const [year, month, day] = dueDateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year:
      date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function isOverdue(task: Task): boolean {
  if (task.status !== 'pending' || !task.dueDateKey) return false;
  return task.dueDateKey < getTodayDateKey();
}

export function isDueTodayOrOverdue(task: Task): boolean {
  if (task.status !== 'pending' || !task.dueDateKey) return false;
  return task.dueDateKey <= getTodayDateKey();
}
