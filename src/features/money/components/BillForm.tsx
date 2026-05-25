import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import type { BillRepeatType } from '@/features/money/types';
import {
  dateAtLocalMidnight,
  getTomorrowDate,
} from '@/features/money/utils/dates';
import type { BillFieldErrors } from '@/features/money/utils/validation';
import { Input } from '@/shared/components';
import { DEFAULT_CURRENCY } from '@/shared/utils/money';
import { colors, radius, spacing, typography } from '@/shared/theme';

export type BillFormValues = {
  name: string;
  amountInput: string;
  repeatType: BillRepeatType;
  dueDate: Date | null;
  dueDayOfMonth: string;
};

type BillFormProps = {
  values: BillFormValues;
  fieldErrors: BillFieldErrors;
  onChange: (values: BillFormValues) => void;
};

export function BillForm({ values, fieldErrors, onChange }: BillFormProps) {
  const [showPicker, setShowPicker] = useState(false);

  const update = (patch: Partial<BillFormValues>) => {
    onChange({ ...values, ...patch });
  };

  const handlePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'dismissed' || !date) return;
    update({ dueDate: dateAtLocalMidnight(date) });
  };

  const dueSummary = values.dueDate
    ? values.dueDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Select due date';

  return (
    <View style={styles.form}>
      <Input
        label="Bill name"
        value={values.name}
        onChangeText={(name) => update({ name })}
        error={fieldErrors.name}
        placeholder="e.g. Internet"
      />
      <Input
        label={`Amount (${DEFAULT_CURRENCY})`}
        value={values.amountInput}
        onChangeText={(amountInput) => update({ amountInput })}
        error={fieldErrors.amount}
        placeholder="15000 or 15000.50"
        keyboardType="decimal-pad"
      />

      <Text style={styles.sectionLabel}>Repeat</Text>
      <View style={styles.chipRow}>
        {(['none', 'monthly'] as const).map((type) => {
          const selected = values.repeatType === type;
          return (
            <Pressable
              key={type}
              onPress={() => update({ repeatType: type })}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {type === 'none' ? 'One-time' : 'Monthly'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {values.repeatType === 'none' ? (
        <>
          <Text style={styles.sectionLabel}>Due date</Text>
          <View style={styles.chipRow}>
            <Pressable
              onPress={() => update({ dueDate: dateAtLocalMidnight(new Date()) })}
              style={styles.chip}
            >
              <Text style={styles.chipLabel}>Today</Text>
            </Pressable>
            <Pressable
              onPress={() => update({ dueDate: getTomorrowDate() })}
              style={styles.chip}
            >
              <Text style={styles.chipLabel}>Tomorrow</Text>
            </Pressable>
            <Pressable onPress={() => setShowPicker(true)} style={styles.chip}>
              <Text style={styles.chipLabel}>Pick date</Text>
            </Pressable>
          </View>
          <Text style={styles.hint}>{dueSummary}</Text>
          {fieldErrors.dueDate ? (
            <Text style={styles.error}>{fieldErrors.dueDate}</Text>
          ) : null}
          {showPicker ? (
            <DateTimePicker
              value={values.dueDate ?? new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handlePickerChange}
              themeVariant="dark"
            />
          ) : null}
        </>
      ) : (
        <Input
          label="Due day of month (1–31)"
          value={values.dueDayOfMonth}
          onChangeText={(dueDayOfMonth) => update({ dueDayOfMonth })}
          error={fieldErrors.dueDayOfMonth}
          keyboardType="number-pad"
          placeholder="15"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.md },
  sectionLabel: { ...typography.label, marginTop: spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  chipLabel: { ...typography.bodySmall, color: colors.textSecondary },
  chipLabelSelected: { color: colors.primary, fontWeight: '600' },
  hint: { ...typography.caption, color: colors.textMuted },
  error: { ...typography.caption, color: colors.error },
});
