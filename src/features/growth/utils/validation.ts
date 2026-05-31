import type { CreateHabitInput, UpdateHabitInput } from '@/features/growth/types';

export type HabitFieldErrors = Partial<Record<'title' | 'description', string>>;

const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 500;

export function validateHabitTitle(title: string): string | undefined {
  const trimmed = title.trim();
  if (!trimmed) return 'Title is required';
  if (trimmed.length > MAX_TITLE_LENGTH) {
    return `Title must be ${MAX_TITLE_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateCreateHabitInput(input: CreateHabitInput): HabitFieldErrors {
  const errors: HabitFieldErrors = {};
  const titleError = validateHabitTitle(input.title);
  if (titleError) errors.title = titleError;
  if (input.description && input.description.trim().length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
  }
  return errors;
}

export function validateUpdateHabitInput(input: UpdateHabitInput): HabitFieldErrors {
  const errors: HabitFieldErrors = {};
  if (input.title !== undefined) {
    const titleError = validateHabitTitle(input.title);
    if (titleError) errors.title = titleError;
  }
  if (
    input.description !== undefined &&
    input.description &&
    input.description.trim().length > MAX_DESCRIPTION_LENGTH
  ) {
    errors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
  }
  return errors;
}

export function getFirstHabitFieldError(
  errors: HabitFieldErrors,
): string | undefined {
  return Object.values(errors).find(Boolean);
}
