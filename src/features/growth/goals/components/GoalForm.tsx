import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';

import { GoalCategoryChips } from '@/features/growth/goals/components/GoalCategoryChips';
import { GoalProgressBar } from '@/features/growth/goals/components/GoalProgressBar';
import type { GoalCategory } from '@/features/growth/goals/types';
import {
  dateAtLocalMidnight,
  getTomorrowDate,
} from '@/features/growth/goals/utils/dates';
import { getLocalDateKey } from '@/features/growth/utils/dates';
import type { GoalFieldErrors } from '@/features/growth/goals/utils/validation';
import { Input } from '@/shared/components';
import { colors, radius, spacing, typography } from '@/shared/theme';

export type GoalFormValues = {
  title: string;
  description: string;
  category: GoalCategory;
  progressPercent: number;
  targetDate: Date | null;
};

type GoalFormProps = {
  values: GoalFormValues;
  fieldErrors: GoalFieldErrors;
  onChange: (values: GoalFormValues) => void;
};

type TargetChip = 'none' | 'today' | 'tomorrow' | 'custom';

function getTargetChip(targetDate: Date | null): TargetChip {
  if (!targetDate) return 'none';
  const key = getLocalDateKey(targetDate);
  if (key === getLocalDateKey(new Date())) return 'today';
  if (key === getLocalDateKey(getTomorrowDate())) return 'tomorrow';
  return 'custom';
}

function clampProgress(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function GoalForm({ values, fieldErrors, onChange }: GoalFormProps) {
  const [showPicker, setShowPicker] = useState(false);
  const targetChip = getTargetChip(values.targetDate);

  const update = (patch: Partial<GoalFormValues>) => {
    onChange({ ...values, ...patch });
  };

  const handlePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'dismissed' || !date) return;
    update({ targetDate: dateAtLocalMidnight(date) });
  };

  const targetSummary = values.targetDate
    ? values.targetDate.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : 'No target date';

  const handleProgressText = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits === '') {
      update({ progressPercent: 0 });
      return;
    }
    update({ progressPercent: clampProgress(Number(digits)) });
  };

  return (
    <View style={styles.form}>
      <Input
        label="Title"
        value={values.title}
        onChangeText={(title) => update({ title })}
        error={fieldErrors.title}
        placeholder="Goal title"
      />
      <Input
        label="Description"
        value={values.description}
        onChangeText={(description) => update({ description })}
        error={fieldErrors.description}
        placeholder="Optional"
        multiline
        numberOfLines={4}
        style={styles.description}
      />

      <Text style={styles.sectionLabel}>Category</Text>
      <GoalCategoryChips
        value={values.category}
        onChange={(category) => update({ category })}
        error={fieldErrors.category}
      />

      <Text style={styles.sectionLabel}>Progress</Text>
      <View style={styles.progressBlock}>
        <TextInput
          style={[
            styles.progressInput,
            fieldErrors.progressPercent ? styles.inputError : null,
          ]}
          value={String(values.progressPercent)}
          onChangeText={handleProgressText}
          keyboardType="number-pad"
          maxLength={3}
          placeholderTextColor={colors.textMuted}
        />
        <Text style={styles.percentSuffix}>%</Text>
        <View style={styles.progressBarWrap}>
          <GoalProgressBar percent={values.progressPercent} />
        </View>
      </View>
      {fieldErrors.progressPercent ? (
        <Text style={styles.fieldError}>{fieldErrors.progressPercent}</Text>
      ) : null}

      <Text style={styles.sectionLabel}>Target date</Text>
      <View style={styles.targetRow}>
        {(
          [
            ['none', 'No target'],
            ['today', 'Today'],
            ['tomorrow', 'Tomorrow'],
          ] as const
        ).map(([chip, label]) => {
          const selected = targetChip === chip;
          return (
            <Pressable
              key={chip}
              onPress={() => {
                if (chip === 'none') update({ targetDate: null });
                if (chip === 'today')
                  update({ targetDate: dateAtLocalMidnight(new Date()) });
                if (chip === 'tomorrow')
                  update({ targetDate: getTomorrowDate() });
              }}
              style={[styles.targetChip, selected && styles.targetChipSelected]}
            >
              <Text
                style={[
                  styles.targetLabel,
                  selected && styles.targetLabelSelected,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          onPress={() => setShowPicker(true)}
          style={[
            styles.targetChip,
            targetChip === 'custom' && styles.targetChipSelected,
          ]}
        >
          <Text
            style={[
              styles.targetLabel,
              targetChip === 'custom' && styles.targetLabelSelected,
            ]}
          >
            Pick date
          </Text>
        </Pressable>
      </View>
      <Text style={styles.targetSummary}>{targetSummary}</Text>

      {showPicker ? (
        <DateTimePicker
          value={values.targetDate ?? new Date()}
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
  description: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    ...typography.label,
    marginTop: spacing.xs,
  },
  progressBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  progressInput: {
    ...typography.body,
    width: 64,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  inputError: {
    borderColor: colors.error,
  },
  percentSuffix: {
    ...typography.body,
    color: colors.textMuted,
  },
  progressBarWrap: {
    flex: 1,
    minWidth: 120,
  },
  fieldError: {
    ...typography.caption,
    color: colors.error,
  },
  targetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  targetChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  targetChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  targetLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  targetLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  targetSummary: {
    ...typography.caption,
    color: colors.textMuted,
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
