import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { MoreStackParamList } from '@/features/more/navigation/types';
import { RemindersForm } from '@/features/reminders/components/RemindersForm';
import { DEFAULT_REMINDER_TIMES } from '@/features/reminders/constants';
import { useReminderSettings } from '@/features/reminders/hooks/useReminderSettings';
import type { ReminderFormValues } from '@/features/reminders/types';
import {
  getFirstReminderFieldError,
  validateReminderSettingsInput,
} from '@/features/reminders/utils/validation';
import {
  getReminderPermissionState,
  isPermissionGranted,
  requestReminderPermission,
} from '@/features/reminders/services/permissions';
import { Button, ErrorMessage, Screen } from '@/shared/components';
import { useActionLock } from '@/shared/hooks/useActionLock';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type RemindersNavigation = NativeStackNavigationProp<
  MoreStackParamList,
  'RemindersSettings'
>;

function settingsToFormValues(
  settings: ReturnType<typeof useReminderSettings>['settings'],
): ReminderFormValues {
  return {
    enabled: settings.enabled,
    todayFocusEnabled: settings.todayFocusEnabled,
    todayFocusTime: settings.todayFocusTime,
    habitsEnabled: settings.habitsEnabled,
    habitsTime: settings.habitsTime,
    tasksEnabled: settings.tasksEnabled,
    tasksTime: settings.tasksTime,
    billsEnabled: settings.billsEnabled,
    billsTime: settings.billsTime,
  };
}

function applyDefaultTimes(values: ReminderFormValues): ReminderFormValues {
  return {
    ...values,
    todayFocusTime:
      values.todayFocusEnabled && !values.todayFocusTime
        ? DEFAULT_REMINDER_TIMES.todayFocus
        : values.todayFocusTime,
    habitsTime:
      values.habitsEnabled && !values.habitsTime
        ? DEFAULT_REMINDER_TIMES.habits
        : values.habitsTime,
    tasksTime:
      values.tasksEnabled && !values.tasksTime
        ? DEFAULT_REMINDER_TIMES.tasks
        : values.tasksTime,
    billsTime:
      values.billsEnabled && !values.billsTime
        ? DEFAULT_REMINDER_TIMES.bills
        : values.billsTime,
  };
}

export function RemindersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RemindersNavigation>();
  const { settings, isLoading, error, retry, saveSettings } = useReminderSettings();
  const { busy, runLocked } = useActionLock();

  const [values, setValues] = useState<ReminderFormValues>(
    settingsToFormValues(settings),
  );
  const [fieldErrors, setFieldErrors] = useState<
    ReturnType<typeof validateReminderSettingsInput>
  >({});
  const [formError, setFormError] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    setValues(settingsToFormValues(settings));
  }, [settings]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const state = await getReminderPermissionState();
      if (!cancelled) {
        setPermissionDenied(state === 'denied');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [values.enabled]);

  const handleMasterToggle = async (enabled: boolean) => {
    setFormError('');
    setFieldErrors({});

    if (!enabled) {
      setValues((current) => ({ ...current, enabled: false }));
      setPermissionDenied(false);
      return;
    }

    const permission = await requestReminderPermission();
    if (!isPermissionGranted(permission)) {
      setValues((current) => ({ ...current, enabled: false }));
      setPermissionDenied(permission === 'denied');
      setFieldErrors({
        permission:
          permission === 'denied'
            ? 'Notifications are off. Enable them in system settings to receive reminders.'
            : 'Notification permission was not granted.',
      });
      return;
    }

    setPermissionDenied(false);
    setValues((current) => ({ ...current, enabled: true }));
  };

  const handleSave = () => {
    runLocked(async () => {
      setFormError('');
      const prepared = applyDefaultTimes(values);
      const errors = validateReminderSettingsInput(prepared);
      setFieldErrors(errors);
      if (getFirstReminderFieldError(errors)) {
        setValues(prepared);
        return;
      }

      if (prepared.enabled) {
        const permission = await requestReminderPermission();
        if (!isPermissionGranted(permission)) {
          setPermissionDenied(permission === 'denied');
          setFieldErrors({
            permission:
              'Notifications are off. Enable them in system settings to receive reminders.',
          });
          setValues((current) => ({ ...current, enabled: false }));
          return;
        }
        setPermissionDenied(false);
      }

      try {
        await saveSettings(prepared);
        setValues(prepared);
        navigation.goBack();
      } catch (err) {
        setFormError(getFirestoreErrorMessage(err));
      }
    });
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Reminders</Text>
        <Text style={styles.subtitle}>
          Local daily reminders on this device. No push notifications in this
          version.
        </Text>
      </View>

      {error ? (
        <View style={styles.block}>
          <ErrorMessage message={error} />
          <Button title="Retry" onPress={retry} variant="secondary" />
        </View>
      ) : isLoading ? (
        <Text style={styles.loading}>Loading reminder settings…</Text>
      ) : (
        <>
          <RemindersForm
            values={values}
            fieldErrors={fieldErrors}
            permissionDenied={permissionDenied}
            onChange={setValues}
            onMasterToggle={handleMasterToggle}
          />
          {formError ? <ErrorMessage message={formError} /> : null}
          <Button title="Save" onPress={handleSave} loading={busy} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  back: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  loading: {
    ...typography.body,
    color: colors.textMuted,
  },
  block: {
    gap: spacing.md,
  },
});
