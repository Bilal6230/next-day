import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { TaskPriorityBadge } from '@/features/tasks/components/TaskPriorityBadge';
import type { Task } from '@/features/tasks/types';
import {
  formatDueDateLabel,
  isOverdue,
} from '@/features/tasks/utils/dates';
import { Card } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type TaskListItemProps = {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

export function TaskListItem({
  task,
  onPress,
  onToggleComplete,
  onArchive,
  onDelete,
}: TaskListItemProps) {
  const overdue = isOverdue(task);
  const isCompleted = task.status === 'completed';
  const isArchived = task.status === 'archived';

  const handleDelete = () => {
    Alert.alert(
      'Delete permanently?',
      'This task will be removed and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ],
    );
  };

  const handleArchive = () => {
    Alert.alert('Archive task?', 'You can find it under the Archived filter.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Archive', onPress: onArchive },
    ]);
  };

  return (
    <Card style={styles.card}>
      <Pressable onPress={onPress} style={styles.main}>
        {isArchived ? (
          <View style={styles.checkboxSpacer} />
        ) : (
          <Pressable
            onPress={onToggleComplete}
            style={[styles.checkbox, isCompleted && styles.checkboxDone]}
            hitSlop={8}
          >
            {isCompleted ? <Text style={styles.checkmark}>✓</Text> : null}
          </Pressable>
        )}

        <View style={styles.content}>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {task.notes ? (
            <Text style={styles.notesPreview} numberOfLines={1}>
              {task.notes}
            </Text>
          ) : null}
          <View style={styles.meta}>
            <TaskPriorityBadge priority={task.priority} />
            <Text style={[styles.dueLabel, overdue && styles.overdueLabel]}>
              {formatDueDateLabel(task.dueDateKey, { overdue })}
            </Text>
          </View>
        </View>
      </Pressable>

      {task.status !== 'archived' ? (
        <View style={styles.actions}>
          <Pressable onPress={handleArchive} hitSlop={8}>
            <Text style={styles.actionText}>Archive</Text>
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={8}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.actions}>
          <Pressable onPress={handleDelete} hitSlop={8}>
            <Text style={styles.deleteText}>Delete permanently</Text>
          </Pressable>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  main: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  checkboxSpacer: {
    width: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
  },
  titleCompleted: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  notesPreview: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  dueLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  overdueLabel: {
    color: colors.error,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  deleteText: {
    ...typography.bodySmall,
    color: colors.error,
    fontWeight: '500',
  },
});
