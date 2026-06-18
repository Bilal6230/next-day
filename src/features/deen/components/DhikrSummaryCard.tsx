import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type DhikrSummaryCardProps = {
  completedCount: number;
  totalCount: number;
};

export function DhikrSummaryCard({
  completedCount,
  totalCount,
}: DhikrSummaryCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Today</Text>
      <Text style={styles.value}>
        {completedCount} / {totalCount} dhikrs completed
      </Text>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%',
            },
          ]}
        />
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
  value: {
    ...typography.title,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});
