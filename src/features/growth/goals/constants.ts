import type { GoalCategory, GoalListFilter } from '@/features/growth/goals/types';

export const MAX_GOAL_TITLE_LENGTH = 160;
export const MAX_GOAL_DESCRIPTION_LENGTH = 2000;

export const GOAL_CATEGORIES: GoalCategory[] = [
  'personal',
  'work',
  'finance',
  'health',
  'learning',
  'spiritual',
  'other',
];

export const FILTER_LABELS: Record<GoalListFilter, string> = {
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
};

export const CATEGORY_LABELS: Record<GoalCategory, string> = {
  personal: 'Personal',
  work: 'Work',
  finance: 'Finance',
  health: 'Health',
  learning: 'Learning',
  spiritual: 'Spiritual',
  other: 'Other',
};
