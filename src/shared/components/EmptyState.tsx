import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/shared/theme';

type EmptyStateProps = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  description: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
