import { colors } from '@/shared/theme';

import type { TaskPriority } from '@/features/tasks/types';

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: colors.textMuted,
  medium: '#60A5FA',
  high: '#FBBF24',
  urgent: colors.error,
};

export const FILTER_LABELS = {
  all: 'All',
  today: 'Today',
  completed: 'Completed',
  archived: 'Archived',
} as const;
