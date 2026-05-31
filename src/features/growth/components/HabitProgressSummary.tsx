import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type HabitProgressSummaryProps = {
  completedTodayCount: number;
  totalActiveHabits: number;
  weeklyCompletionCount: number;
};

export function HabitProgressSummary({
  completedTodayCount,
  totalActiveHabits,
  weeklyCompletionCount,
}: HabitProgressSummaryProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Today</Text>
      <Text style={styles.todayValue}>
        {completedTodayCount} / {totalActiveHabits} habits completed
      </Text>
      <Text style={styles.weekly}>
        {weeklyCompletionCount} completion
        {weeklyCompletionCount === 1 ? '' : 's'} this week
      </Text>
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
  todayValue: {
    ...typography.title,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  weekly: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
