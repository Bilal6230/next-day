import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/shared/theme';

type AuthHeaderProps = {
  title: string;
  subtitle: string;
};

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.brand}>Next Day</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  brand: {
    ...typography.label,
    color: colors.primary,
  },
  title: {
    ...typography.hero,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
