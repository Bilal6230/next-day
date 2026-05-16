import { StyleSheet, Text, View } from 'react-native';

import { Card, EmptyState } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type DashboardCardProps = {
  title: string;
  emptyTitle: string;
  emptyDescription?: string;
  accent?: string;
};

export function DashboardCard({
  title,
  emptyTitle,
  emptyDescription,
  accent = colors.primary,
}: DashboardCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.accent, { backgroundColor: accent }]} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <EmptyState title={emptyTitle} description={emptyDescription} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  accent: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  title: {
    ...typography.heading,
  },
});
