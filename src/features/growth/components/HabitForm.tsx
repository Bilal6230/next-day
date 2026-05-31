import { StyleSheet, Text, View } from 'react-native';

import type { HabitFieldErrors } from '@/features/growth/utils/validation';
import { Input } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

export type HabitFormValues = {
  title: string;
  description: string;
};

type HabitFormProps = {
  values: HabitFormValues;
  fieldErrors: HabitFieldErrors;
  onChange: (values: HabitFormValues) => void;
};

export function HabitForm({ values, fieldErrors, onChange }: HabitFormProps) {
  const update = (patch: Partial<HabitFormValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <View style={styles.form}>
      <Input
        label="Title"
        value={values.title}
        onChangeText={(title) => update({ title })}
        error={fieldErrors.title}
        placeholder="e.g. Morning walk"
      />
      <Input
        label="Description"
        value={values.description}
        onChangeText={(description) => update({ description })}
        error={fieldErrors.description}
        placeholder="Optional"
        multiline
        numberOfLines={3}
        style={styles.description}
      />
      <Text style={styles.frequency}>Frequency: Daily</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  description: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  frequency: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
