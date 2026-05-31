import { StyleSheet, Switch, Text, View } from 'react-native';

import type { NoteFieldErrors } from '@/features/notes/utils/validation';
import { Input } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

export type NoteFormValues = {
  title: string;
  body: string;
  tags: string;
  pinned: boolean;
};

type NoteFormProps = {
  values: NoteFormValues;
  fieldErrors: NoteFieldErrors;
  onChange: (values: NoteFormValues) => void;
};

export function NoteForm({ values, fieldErrors, onChange }: NoteFormProps) {
  const update = (patch: Partial<NoteFormValues>) => {
    onChange({ ...values, ...patch });
  };

  return (
    <View style={styles.form}>
      <Input
        label="Title"
        value={values.title}
        onChangeText={(title) => update({ title })}
        error={fieldErrors.title}
        placeholder="Note title"
      />
      <Input
        label="Body"
        value={values.body}
        onChangeText={(body) => update({ body })}
        error={fieldErrors.body}
        placeholder="Optional"
        multiline
        numberOfLines={6}
        style={styles.body}
      />
      <Input
        label="Tags"
        value={values.tags}
        onChangeText={(tags) => update({ tags })}
        error={fieldErrors.tags}
        placeholder="Comma-separated (optional)"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.pinnedRow}>
        <Text style={styles.pinnedLabel}>Pinned</Text>
        <Switch
          value={values.pinned}
          onValueChange={(pinned) => update({ pinned })}
          trackColor={{ false: colors.border, true: colors.primaryMuted }}
          thumbColor={values.pinned ? colors.primary : colors.textMuted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  body: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  pinnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  pinnedLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
