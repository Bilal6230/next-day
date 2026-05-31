import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { EXPENSE_CATEGORIES } from '@/features/money/constants';
import type { ExpenseCategory } from '@/features/money/types';
import {
  dateAtLocalMidnight,
  getTomorrowDate,
} from '@/features/money/utils/dates';
import type { ExpenseFieldErrors } from '@/features/money/utils/validation';
import { Input } from '@/shared/components';
import { DEFAULT_CURRENCY } from '@/shared/utils/money';
import { colors, radius, spacing, typography } from '@/shared/theme';

export type ExpenseFormValues = {
  title: string;
  amountInput: string;
  category: ExpenseCategory;
  spentDate: Date;
  notes: string;
};

type ExpenseFormProps = {
  values: ExpenseFormValues;
  fieldErrors: ExpenseFieldErrors;
  onChange: (values: ExpenseFormValues) => void;
};

export function ExpenseForm({ values, fieldErrors, onChange }: ExpenseFormProps) {
  const [showPicker, setShowPicker] = useState(false);

  const update = (patch: Partial<ExpenseFormValues>) => {
    onChange({ ...values, ...patch });
  };

  const handlePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') setShowPicker(false);
    if (event.type === 'dismissed' || !date) return;
    update({ spentDate: dateAtLocalMidnight(date) });
  };

  return (
    <View style={styles.form}>
      <Input
        label="Title"
        value={values.title}
        onChangeText={(title) => update({ title })}
        error={fieldErrors.title}
        placeholder="What did you spend on?"
      />
      <Input
        label={`Amount (${DEFAULT_CURRENCY})`}
        value={values.amountInput}
        onChangeText={(amountInput) => update({ amountInput })}
        error={fieldErrors.amount}
        placeholder="1500 or 1500.50"
        keyboardType="decimal-pad"
      />

      <Text style={styles.sectionLabel}>Category</Text>
      <View style={styles.chipRow}>
        {EXPENSE_CATEGORIES.map((category) => {
          const selected = values.category === category;
          return (
            <Pressable
              key={category}
              onPress={() => update({ category })}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text
                style={[styles.chipLabel, selected && styles.chipLabelSelected]}
              >
                {category}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {fieldErrors.category ? (
        <Text style={styles.error}>{fieldErrors.category}</Text>
      ) : null}

      <Text style={styles.sectionLabel}>Spent date</Text>
      <View style={styles.chipRow}>
        <Pressable
          onPress={() => update({ spentDate: dateAtLocalMidnight(new Date()) })}
          style={styles.chip}
        >
          <Text style={styles.chipLabel}>Today</Text>
        </Pressable>
        <Pressable
          onPress={() => update({ spentDate: getTomorrowDate() })}
          style={styles.chip}
        >
          <Text style={styles.chipLabel}>Tomorrow</Text>
        </Pressable>
        <Pressable onPress={() => setShowPicker(true)} style={styles.chip}>
          <Text style={styles.chipLabel}>Pick date</Text>
        </Pressable>
      </View>
      <Text style={styles.hint}>
        {values.spentDate.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </Text>
      {showPicker ? (
        <DateTimePicker
          value={values.spentDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handlePickerChange}
          themeVariant="dark"
        />
      ) : null}

      <Input
        label="Notes"
        value={values.notes}
        onChangeText={(notes) => update({ notes })}
        placeholder="Optional"
        multiline
        numberOfLines={3}
        style={styles.notes}
      />
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
  notes: { minHeight: 80, textAlignVertical: 'top' },
});
