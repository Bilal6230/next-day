import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';

import { formatHHmm, hhmmToDate } from '@/features/reminders/utils/time';
import { colors, radius, spacing, typography } from '@/shared/theme';

type ReminderCategoryRowProps = {
  label: string;
  description: string;
  enabled: boolean;
  time: string | null;
  defaultTime: string;
  onEnabledChange: (enabled: boolean) => void;
  onTimeChange: (time: string) => void;
  disabled?: boolean;
  fieldError?: string;
};

export function ReminderCategoryRow({
  label,
  description,
  enabled,
  time,
  defaultTime,
  onEnabledChange,
  onTimeChange,
  disabled = false,
  fieldError,
}: ReminderCategoryRowProps) {
  const [showPicker, setShowPicker] = useState(false);
  const displayTime = time ?? defaultTime;
  const pickerValue = hhmmToDate(displayTime);

  const handleToggle = () => {
    const nextEnabled = !enabled;
    onEnabledChange(nextEnabled);
    if (nextEnabled && !time) {
      onTimeChange(defaultTime);
    }
  };

  const handlePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed' || !date) return;
    onTimeChange(formatHHmm(date));
  };

  return (
    <View style={[styles.card, disabled && styles.cardDisabled]}>
      <View style={styles.header}>
        <View style={styles.copy}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <Pressable
          onPress={handleToggle}
          disabled={disabled}
          style={[
            styles.toggle,
            enabled && styles.toggleOn,
            disabled && styles.toggleDisabled,
          ]}
          hitSlop={8}
        >
          <View style={[styles.knob, enabled && styles.knobOn]} />
        </Pressable>
      </View>

      {enabled ? (
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>Reminder time</Text>
          <Pressable
            onPress={() => setShowPicker(true)}
            disabled={disabled}
            style={styles.timeButton}
          >
            <Text style={styles.timeValue}>{displayTime}</Text>
          </Pressable>
        </View>
      ) : null}

      {fieldError ? <Text style={styles.error}>{fieldError}</Text> : null}

      {showPicker ? (
        <DateTimePicker
          value={pickerValue}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handlePickerChange}
          themeVariant="dark"
        />
      ) : null}

      {Platform.OS === 'ios' && showPicker ? (
        <Pressable onPress={() => setShowPicker(false)} style={styles.donePicker}>
          <Text style={styles.donePickerText}>Done</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
  },
  description: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  toggleDisabled: {
    opacity: 0.5,
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textMuted,
  },
  knobOn: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  timeLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  timeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  timeValue: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  error: {
    ...typography.caption,
    color: colors.error,
  },
  donePicker: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
  },
  donePickerText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
});
