import type {
  ReminderFieldErrors,
  SaveReminderSettingsInput,
} from '@/features/reminders/types';
import { isValidHHmm } from '@/features/reminders/utils/time';

function validateCategoryTime(
  enabled: boolean,
  time: string | null,
  masterEnabled: boolean,
): string | undefined {
  if (!masterEnabled || !enabled) return undefined;
  if (!time?.trim()) return 'Time is required';
  if (!isValidHHmm(time)) return 'Use HH:mm format (e.g. 09:00)';
  return undefined;
}

export function validateReminderSettingsInput(
  input: SaveReminderSettingsInput,
): ReminderFieldErrors {
  const errors: ReminderFieldErrors = {};

  const todayFocusTimeError = validateCategoryTime(
    input.todayFocusEnabled,
    input.todayFocusTime,
    input.enabled,
  );
  if (todayFocusTimeError) errors.todayFocusTime = todayFocusTimeError;

  const habitsTimeError = validateCategoryTime(
    input.habitsEnabled,
    input.habitsTime,
    input.enabled,
  );
  if (habitsTimeError) errors.habitsTime = habitsTimeError;

  const tasksTimeError = validateCategoryTime(
    input.tasksEnabled,
    input.tasksTime,
    input.enabled,
  );
  if (tasksTimeError) errors.tasksTime = tasksTimeError;

  const billsTimeError = validateCategoryTime(
    input.billsEnabled,
    input.billsTime,
    input.enabled,
  );
  if (billsTimeError) errors.billsTime = billsTimeError;

  return errors;
}

export function getFirstReminderFieldError(
  errors: ReminderFieldErrors,
): string | undefined {
  return Object.values(errors).find(Boolean);
}
