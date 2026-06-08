import type { DailyFocusSourceType } from '@/features/today/focus/types';

export const MAX_FOCUS_TITLE_LENGTH = 160;
export const MAX_FOCUS_NOTE_LENGTH = 1000;
export const FOCUS_NOTE_PREVIEW_LENGTH = 120;

export const SOURCE_TYPE_LABELS: Record<DailyFocusSourceType, string> = {
  custom: 'Custom',
  task: 'Task',
  goal: 'Goal',
};

export const DAILY_FOCUS_SOURCE_TYPES: DailyFocusSourceType[] = [
  'custom',
  'task',
  'goal',
];
