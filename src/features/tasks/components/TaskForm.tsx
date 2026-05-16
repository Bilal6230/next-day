import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';

import { PRIORITY_LABELS } from '@/features/tasks/constants';
import { TASK_PRIORITIES } from '@/features/tasks/types';
import {
  dateAtLocalMidnight,
  getLocalDateKey,
  getTodayDateKey,
  getTomorrowDate,
} from '@/features/tasks/utils/dates';
import type { TaskFieldErrors } from '@/features/tasks/utils/validation';
import { Input } from '@/shared/components';
import { colors, radius, spacing, typography } from '@/shared/theme';

export type TaskFormValues = {
  title: string;
  notes: string;
  priority: import('@/features/tasks/types').TaskPriority;
  dueDate: Date | null;
};

type TaskFormProps = {
  values: TaskFormValues;
  fieldErrors: TaskFieldErrors;
  onChange: (values: TaskFormValues) => void;
};

type DueChip = 'none' | 'today' | 'tomorrow' | 'custom';

function getDueChip(dueDate: Date | null): DueChip {
  if (!dueDate) return 'none';
  const key = getLocalDateKey(dueDate);
  if (key === getTodayDateKey()) return 'today';
  if (key === getLocalDateKey(getTomorrowDate())) return 'tomorrow';
  return 'custom';
}

export function TaskForm({ values, fieldErrors, onChange }: TaskFormProps) {
  const [showPicker, setShowPicker] = useState(false);
  const dueChip = getDueChip(values.dueDate);

  const update = (patch: Partial<TaskFormValues>) => {
    onChange({ ...values, ...patch });
  };

  const handlePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed' || !date) return;
    update({ dueDate: dateAtLocalMidnight(date) });
  };

  const dueDateSummary = values.dueDate
    ? values.dueDate.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : 'No due date';

  return (
    <View style={styles.form}>
      <Input
        label="Title"
        value={values.title}
        onChangeText={(title) => update({ title })}
        error={fieldErrors.title}
        placeholder="What needs to be done?"
      />
      <Input
        label="Notes"
        value={values.notes}
        onChangeText={(notes) => update({ notes })}
        error={fieldErrors.notes}
        placeholder="Optional details"
        multiline
        numberOfLines={4}
        style={styles.notesInput}
      />

      <Text style={styles.sectionLabel}>Priority</Text>
      <View style={styles.priorityRow}>
        {TASK_PRIORITIES.map((priority) => {
          const selected = values.priority === priority;
          return (
            <Pressable
              key={priority}
              onPress={() => update({ priority })}
              style={[styles.priorityChip, selected && styles.prioritySelected]}
            >
              <Text
                style={[
                  styles.priorityLabel,
                  selected && styles.priorityLabelSelected,
                ]}
              >
                {PRIORITY_LABELS[priority]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {fieldErrors.priority ? (
        <Text style={styles.fieldError}>{fieldErrors.priority}</Text>
      ) : null}

      <Text style={styles.sectionLabel}>Due date</Text>
      <View style={styles.dueRow}>
        {(
          [
            ['none', 'No date'],
            ['today', 'Today'],
            ['tomorrow', 'Tomorrow'],
          ] as const
        ).map(([chip, label]) => {
          const selected = dueChip === chip;
          return (
            <Pressable
              key={chip}
              onPress={() => {
                if (chip === 'none') update({ dueDate: null });
                if (chip === 'today')
                  update({ dueDate: dateAtLocalMidnight(new Date()) });
                if (chip === 'tomorrow')
                  update({ dueDate: getTomorrowDate() });
              }}
              style={[styles.dueChip, selected && styles.dueChipSelected]}
            >
              <Text
                style={[styles.dueLabel, selected && styles.dueLabelSelected]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={() => setShowPicker(true)}
          style={[
            styles.dueChip,
            dueChip === 'custom' && styles.dueChipSelected,
          ]}
        >
          <Text
            style={[
              styles.dueLabel,
              dueChip === 'custom' && styles.dueLabelSelected,
            ]}
          >
            Pick date
          </Text>
        </Pressable>
      </View>
      <Text style={styles.dueSummary}>{dueDateSummary}</Text>

      {showPicker ? (
        <DateTimePicker
          value={values.dueDate ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handlePickerChange}
          themeVariant="dark"
        />
      ) : null}
      {Platform.OS === 'ios' && showPicker ? (
        <Pressable
          onPress={() => setShowPicker(false)}
          style={styles.donePicker}
        >
          <Text style={styles.donePickerText}>Done</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    ...typography.label,
    marginTop: spacing.xs,
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  priorityChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  prioritySelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  priorityLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  priorityLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  dueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dueChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dueChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  dueLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  dueLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  dueSummary: {
    ...typography.caption,
    color: colors.textMuted,
  },
  fieldError: {
    ...typography.caption,
    color: colors.error,
  },
  donePicker: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
  },
  donePickerText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
});
