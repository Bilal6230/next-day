import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORY_LABELS } from '@/features/growth/goals/constants';
import { GoalProgressBar } from '@/features/growth/goals/components/GoalProgressBar';
import {
  formatTargetDateLabel,
  isGoalOverdue,
} from '@/features/growth/goals/utils/dates';
import type { Goal } from '@/features/growth/goals/types';
import { Card } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type GoalListItemProps = {
  goal: Goal;
  onPress: () => void;
};

export function GoalListItem({ goal, onPress }: GoalListItemProps) {
  const overdue = isGoalOverdue(goal);

  return (
    <Card style={styles.card}>
      <Pressable onPress={onPress} style={styles.main}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {goal.title}
          </Text>
          <Text style={styles.category}>{CATEGORY_LABELS[goal.category]}</Text>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{goal.progressPercent}%</Text>
          <View style={styles.bar}>
            <GoalProgressBar percent={goal.progressPercent} />
          </View>
        </View>
        <Text style={styles.target}>{formatTargetDateLabel(goal)}</Text>
        {overdue ? <Text style={styles.overdue}>Overdue</Text> : null}
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  main: {
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
  category: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
    width: 40,
  },
  bar: {
    flex: 1,
  },
  target: {
    ...typography.caption,
    color: colors.textMuted,
  },
  overdue: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
});
