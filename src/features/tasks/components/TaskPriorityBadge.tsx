import { StyleSheet, Text, View } from 'react-native';

import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/features/tasks/constants';
import type { TaskPriority } from '@/features/tasks/types';
import { radius, spacing, typography } from '@/shared/theme';

type TaskPriorityBadgeProps = {
  priority: TaskPriority;
};

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  const color = PRIORITY_COLORS[priority];

  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{PRIORITY_LABELS[priority]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
});
