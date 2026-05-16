import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/shared/theme';

type LoadingOverlayProps = {
  message?: string;
};

export function LoadingOverlay({ message = 'Loading…' }: LoadingOverlayProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  message: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
