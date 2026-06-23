import { StyleSheet, Text, View } from 'react-native';

import type { PrayerSummary } from '@/features/deen/prayer/types';
import { Card } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type PrayerSummaryCardProps = {
  summary: PrayerSummary;
};

export function PrayerSummaryCard({ summary }: PrayerSummaryCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Today</Text>
      <Text style={styles.completed}>
        {summary.completedCount} / {summary.totalCount} completed
      </Text>
      <View style={styles.row}>
        <Text style={styles.meta}>Pending {summary.pendingCount}</Text>
        <Text style={styles.meta}>Missed {summary.missedCount}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  completed: {
    ...typography.title,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
