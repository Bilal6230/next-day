import { Timestamp } from 'firebase/firestore';

import { getLocalDateKey } from '@/features/growth/utils/dates';
import type { Goal } from '@/features/growth/goals/types';

export function dateAtLocalMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getTomorrowDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function targetDateToFields(targetDate: Date | null): {
  targetDate: Timestamp | null;
  targetDateKey: string | null;
} {
  if (!targetDate) {
    return { targetDate: null, targetDateKey: null };
  }
  const normalized = dateAtLocalMidnight(targetDate);
  return {
    targetDate: Timestamp.fromDate(normalized),
    targetDateKey: getLocalDateKey(normalized),
  };
}

export function timestampToDate(timestamp: Goal['targetDate']): Date | null {
  if (!timestamp) return null;
  return timestamp.toDate();
}

export function formatTargetDateLabel(goal: Goal): string {
  if (!goal.targetDateKey) return 'No target date';
  const todayKey = getLocalDateKey(new Date());
  if (goal.targetDateKey === todayKey) return 'Target today';
  const tomorrowKey = getLocalDateKey(getTomorrowDate());
  if (goal.targetDateKey === tomorrowKey) return 'Target tomorrow';
  const [year, month, day] = goal.targetDateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return `Target ${date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

export function isGoalOverdue(goal: Goal): boolean {
  if (goal.status !== 'active' || !goal.targetDateKey) return false;
  return goal.targetDateKey < getLocalDateKey(new Date());
}
