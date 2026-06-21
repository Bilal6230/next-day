import { StyleSheet, Text, View } from 'react-native';

import type { AzkarRoutineSummary } from '@/features/deen/azkar/types';
import { Card } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type AzkarSummaryCardProps = {
  morningSummary: AzkarRoutineSummary;
  eveningSummary: AzkarRoutineSummary;
};

export function AzkarSummaryCard({
  morningSummary,
  eveningSummary,
}: AzkarSummaryCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Today</Text>
      <View style={styles.row}>
        <View style={styles.block}>
          <Text style={styles.routineLabel}>Morning</Text>
          <Text style={styles.value}>
            {morningSummary.completedCount} / {morningSummary.totalCount}
          </Text>
        </View>
        <View style={styles.block}>
          <Text style={styles.routineLabel}>Evening</Text>
          <Text style={styles.value}>
            {eveningSummary.completedCount} / {eveningSummary.totalCount}
          </Text>
        </View>
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
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  block: {
    flex: 1,
    gap: spacing.xs,
  },
  routineLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  value: {
    ...typography.heading,
    color: colors.primary,
  },
});
