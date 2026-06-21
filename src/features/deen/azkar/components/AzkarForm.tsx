import { StyleSheet, Text, View } from 'react-native';

import { getRoutineLabel } from '@/features/deen/azkar/constants';
import type { AzkarFieldErrors, AzkarFormValues, AzkarRoutine } from '@/features/deen/azkar/types';
import { Input } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type AzkarFormProps = {
  routine: AzkarRoutine;
  values: AzkarFormValues;
  fieldErrors: AzkarFieldErrors;
  onChange: (values: AzkarFormValues) => void;
};

export function AzkarForm({
  routine,
  values,
  fieldErrors,
  onChange,
}: AzkarFormProps) {
  const update = (patch: Partial<AzkarFormValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <View style={styles.form}>
      <Text style={styles.routineLabel}>
        Routine: {getRoutineLabel(routine)}
      </Text>
      <Input
        label="Title"
        value={values.title}
        onChangeText={(title) => update({ title })}
        error={fieldErrors.title}
        placeholder="e.g. Morning remembrance"
      />
      <Input
        label="Phrase"
        value={values.phrase}
        onChangeText={(phrase) => update({ phrase })}
        error={fieldErrors.phrase}
        placeholder="Arabic or text phrase"
        multiline
        numberOfLines={2}
        style={styles.multiline}
      />
      <Input
        label="Transliteration (optional)"
        value={values.transliteration}
        onChangeText={(transliteration) => update({ transliteration })}
        error={fieldErrors.transliteration}
        placeholder="Optional"
      />
      <Input
        label="Translation (optional)"
        value={values.translation}
        onChangeText={(translation) => update({ translation })}
        error={fieldErrors.translation}
        placeholder="Optional"
        multiline
        numberOfLines={2}
        style={styles.multiline}
      />
      <Input
        label="Target count"
        value={values.targetCount}
        onChangeText={(targetCount) => update({ targetCount })}
        error={fieldErrors.targetCount}
        placeholder="1"
        keyboardType="number-pad"
      />
      <Text style={styles.hint}>Category: Custom</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  routineLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
