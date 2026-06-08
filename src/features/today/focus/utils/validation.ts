import {
  DAILY_FOCUS_SOURCE_TYPES,
  MAX_FOCUS_NOTE_LENGTH,
  MAX_FOCUS_TITLE_LENGTH,
} from '@/features/today/focus/constants';
import type {
  DailyFocusSourceType,
  SetDailyFocusInput,
} from '@/features/today/focus/types';

export type DailyFocusFieldErrors = Partial<
  Record<'title' | 'note' | 'sourceType' | 'sourceId', string>
>;

export function isDailyFocusSourceType(
  value: string,
): value is DailyFocusSourceType {
  return DAILY_FOCUS_SOURCE_TYPES.includes(value as DailyFocusSourceType);
}

export function validateFocusTitle(title: string): string | undefined {
  const trimmed = title.trim();
  if (!trimmed) return 'Title is required';
  if (trimmed.length > MAX_FOCUS_TITLE_LENGTH) {
    return `Title must be ${MAX_FOCUS_TITLE_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateFocusNote(
  note: string | null,
  sourceType: DailyFocusSourceType,
): string | undefined {
  if (sourceType !== 'custom') {
    if (note != null && note !== '') {
      return 'Note is only allowed for custom focus';
    }
    return undefined;
  }
  if (note == null || note === '') return undefined;
  if (note.length > MAX_FOCUS_NOTE_LENGTH) {
    return `Note must be ${MAX_FOCUS_NOTE_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateSetDailyFocusInput(
  input: SetDailyFocusInput,
): DailyFocusFieldErrors {
  const errors: DailyFocusFieldErrors = {};

  if (!isDailyFocusSourceType(input.sourceType)) {
    errors.sourceType = 'Invalid focus source';
    return errors;
  }

  const titleError = validateFocusTitle(input.title);
  if (titleError) errors.title = titleError;

  const noteError = validateFocusNote(input.note, input.sourceType);
  if (noteError) errors.note = noteError;

  if (input.sourceType === 'custom') {
    if (input.sourceId != null && input.sourceId !== '') {
      errors.sourceId = 'Custom focus cannot have a source ID';
    }
  } else if (!input.sourceId?.trim()) {
    errors.sourceId = 'Source ID is required';
  }

  return errors;
}

export function getFirstDailyFocusFieldError(
  errors: DailyFocusFieldErrors,
): string | undefined {
  return Object.values(errors).find(Boolean);
}
