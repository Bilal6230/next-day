import { StyleSheet, Text, View } from 'react-native';

import { ReminderCategoryRow } from '@/features/reminders/components/ReminderCategoryRow';
import { ReminderMasterToggle } from '@/features/reminders/components/ReminderMasterToggle';
import {
  DEFAULT_REMINDER_TIMES,
  REMINDER_CATEGORY_DESCRIPTIONS,
  REMINDER_CATEGORY_LABELS,
} from '@/features/reminders/constants';
import type {
  ReminderFieldErrors,
  ReminderFormValues,
} from '@/features/reminders/types';
import { colors, spacing, typography } from '@/shared/theme';

type RemindersFormProps = {
  values: ReminderFormValues;
  fieldErrors: ReminderFieldErrors;
  permissionDenied: boolean;
  onChange: (values: ReminderFormValues) => void;
  onMasterToggle: (enabled: boolean) => void;
};

export function RemindersForm({
  values,
  fieldErrors,
  permissionDenied,
  onChange,
  onMasterToggle,
}: RemindersFormProps) {
  const categoriesDisabled = !values.enabled;

  const update = (patch: Partial<ReminderFormValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <View style={styles.form}>
      <ReminderMasterToggle
        enabled={values.enabled}
        onChange={onMasterToggle}
      />

      {permissionDenied ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Notifications are off. Enable them in system settings to receive
            reminders.
          </Text>
        </View>
      ) : null}

      {fieldErrors.permission ? (
        <Text style={styles.error}>{fieldErrors.permission}</Text>
      ) : null}

      <ReminderCategoryRow
        label={REMINDER_CATEGORY_LABELS.todayFocus}
        description={REMINDER_CATEGORY_DESCRIPTIONS.todayFocus}
        enabled={values.todayFocusEnabled}
        time={values.todayFocusTime}
        defaultTime={DEFAULT_REMINDER_TIMES.todayFocus}
        onEnabledChange={(todayFocusEnabled) => update({ todayFocusEnabled })}
        onTimeChange={(todayFocusTime) => update({ todayFocusTime })}
        disabled={categoriesDisabled}
        fieldError={fieldErrors.todayFocusTime}
      />

      <ReminderCategoryRow
        label={REMINDER_CATEGORY_LABELS.habits}
        description={REMINDER_CATEGORY_DESCRIPTIONS.habits}
        enabled={values.habitsEnabled}
        time={values.habitsTime}
        defaultTime={DEFAULT_REMINDER_TIMES.habits}
        onEnabledChange={(habitsEnabled) => update({ habitsEnabled })}
        onTimeChange={(habitsTime) => update({ habitsTime })}
        disabled={categoriesDisabled}
        fieldError={fieldErrors.habitsTime}
      />

      <ReminderCategoryRow
        label={REMINDER_CATEGORY_LABELS.tasks}
        description={REMINDER_CATEGORY_DESCRIPTIONS.tasks}
        enabled={values.tasksEnabled}
        time={values.tasksTime}
        defaultTime={DEFAULT_REMINDER_TIMES.tasks}
        onEnabledChange={(tasksEnabled) => update({ tasksEnabled })}
        onTimeChange={(tasksTime) => update({ tasksTime })}
        disabled={categoriesDisabled}
        fieldError={fieldErrors.tasksTime}
      />

      <ReminderCategoryRow
        label={REMINDER_CATEGORY_LABELS.bills}
        description={REMINDER_CATEGORY_DESCRIPTIONS.bills}
        enabled={values.billsEnabled}
        time={values.billsTime}
        defaultTime={DEFAULT_REMINDER_TIMES.bills}
        onEnabledChange={(billsEnabled) => update({ billsEnabled })}
        onTimeChange={(billsTime) => update({ billsTime })}
        disabled={categoriesDisabled}
        fieldError={fieldErrors.billsTime}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  banner: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
  },
  bannerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  error: {
    ...typography.caption,
    color: colors.error,
  },
});
