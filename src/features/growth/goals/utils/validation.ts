import {
  GOAL_CATEGORIES,
  MAX_GOAL_DESCRIPTION_LENGTH,
  MAX_GOAL_TITLE_LENGTH,
} from '@/features/growth/goals/constants';
import type {
  CreateGoalInput,
  GoalCategory,
  GoalStatus,
  UpdateGoalInput,
} from '@/features/growth/goals/types';

export type GoalFieldErrors = Partial<
  Record<
    'title' | 'description' | 'category' | 'progressPercent' | 'targetDate' | 'status',
    string
  >
>;

const GOAL_STATUSES: GoalStatus[] = ['active', 'completed', 'archived'];

export function isGoalCategory(value: string): value is GoalCategory {
  return GOAL_CATEGORIES.includes(value as GoalCategory);
}

export function isGoalStatus(value: string): value is GoalStatus {
  return GOAL_STATUSES.includes(value as GoalStatus);
}

export function validateGoalTitle(title: string): string | undefined {
  const trimmed = title.trim();
  if (!trimmed) return 'Title is required';
  if (trimmed.length > MAX_GOAL_TITLE_LENGTH) {
    return `Title must be ${MAX_GOAL_TITLE_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateGoalDescription(
  description: string | null | undefined,
): string | undefined {
  if (description == null || description === '') return undefined;
  if (description.length > MAX_GOAL_DESCRIPTION_LENGTH) {
    return `Description must be ${MAX_GOAL_DESCRIPTION_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateProgressPercent(value: number): string | undefined {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    return 'Progress must be a whole number from 0 to 100';
  }
  return undefined;
}

export function validateCreateGoalInput(input: CreateGoalInput): GoalFieldErrors {
  const errors: GoalFieldErrors = {};
  const titleError = validateGoalTitle(input.title);
  if (titleError) errors.title = titleError;
  const descriptionError = validateGoalDescription(input.description);
  if (descriptionError) errors.description = descriptionError;
  if (!isGoalCategory(input.category)) {
    errors.category = 'Invalid category';
  }
  const progressError = validateProgressPercent(input.progressPercent);
  if (progressError) errors.progressPercent = progressError;
  return errors;
}

export function validateUpdateGoalInput(input: UpdateGoalInput): GoalFieldErrors {
  const errors: GoalFieldErrors = {};
  if (input.title !== undefined) {
    const titleError = validateGoalTitle(input.title);
    if (titleError) errors.title = titleError;
  }
  if (input.description !== undefined) {
    const descriptionError = validateGoalDescription(input.description);
    if (descriptionError) errors.description = descriptionError;
  }
  if (input.category !== undefined && !isGoalCategory(input.category)) {
    errors.category = 'Invalid category';
  }
  if (input.progressPercent !== undefined) {
    const progressError = validateProgressPercent(input.progressPercent);
    if (progressError) errors.progressPercent = progressError;
  }
  if (input.status !== undefined && !isGoalStatus(input.status)) {
    errors.status = 'Invalid status';
  }
  return errors;
}

export function getFirstGoalFieldError(
  errors: GoalFieldErrors,
): string | undefined {
  return Object.values(errors).find(Boolean);
}
