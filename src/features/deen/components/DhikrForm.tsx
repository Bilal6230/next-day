import { StyleSheet, Text, View } from 'react-native';

import type { DhikrFieldErrors, DhikrFormValues } from '@/features/deen/types';
import { Input } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type DhikrFormProps = {
  values: DhikrFormValues;
  fieldErrors: DhikrFieldErrors;
  onChange: (values: DhikrFormValues) => void;
};

export function DhikrForm({ values, fieldErrors, onChange }: DhikrFormProps) {
  const update = (patch: Partial<DhikrFormValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <View style={styles.form}>
      <Input
        label="Title"
        value={values.title}
        onChangeText={(title) => update({ title })}
        error={fieldErrors.title}
        placeholder="e.g. Morning dhikr"
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
        placeholder="e.g. 33"
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
  multiline: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
