import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import type { MainTabParamList } from '@/app/navigation/types';
import { TaskPriorityBadge } from '@/features/tasks/components/TaskPriorityBadge';
import { useTasksDueToday } from '@/features/tasks/hooks/useTasksDueToday';
import { isOverdue } from '@/features/tasks/utils/dates';
import { Card, EmptyState, ErrorMessage } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

const MAX_TASKS = 3;
const ACCENT = '#60A5FA';

export function TasksDueTodayCard() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { tasks, isLoading, error, retry } = useTasksDueToday();
  const preview = tasks.slice(0, MAX_TASKS);

  const openTasksToday = () => {
    navigation.navigate('Tasks', {
      screen: 'TasksList',
      params: { filter: 'today' },
    });
  };

  const openAddTask = () => {
    navigation.navigate('Tasks', {
      screen: 'TaskForm',
      params: {},
    });
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.accent, { backgroundColor: ACCENT }]} />
        <Text style={styles.title}>Tasks Due Today</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.loadingText}>Loading tasks…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBlock}>
          <ErrorMessage message={error} />
          <View style={styles.actions}>
            <Pressable onPress={retry} hitSlop={8}>
              <Text style={styles.actionText}>Retry</Text>
            </Pressable>
            <Pressable onPress={openTasksToday} hitSlop={8}>
              <Text style={styles.actionText}>Open Tasks</Text>
            </Pressable>
          </View>
        </View>
      ) : preview.length === 0 ? (
        <View style={styles.emptyBlock}>
          <EmptyState
            title="No tasks due today"
            description="You are clear for now."
          />
          <View style={styles.actions}>
            <Pressable onPress={openAddTask} hitSlop={8}>
              <Text style={styles.actionText}>Add task</Text>
            </Pressable>
            <Pressable onPress={openTasksToday} hitSlop={8}>
              <Text style={styles.actionText}>Open Tasks</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.list}>
          {preview.map((task) => {
            const overdue = isOverdue(task);
            return (
              <View key={task.id} style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.taskTitle} numberOfLines={1}>
                    {task.title}
                  </Text>
                  {overdue ? (
                    <Text style={styles.overdue}>Overdue</Text>
                  ) : null}
                </View>
                <TaskPriorityBadge priority={task.priority} />
              </View>
            );
          })}
          <View style={styles.actions}>
            <Pressable onPress={openTasksToday} hitSlop={8}>
              <Text style={styles.actionText}>View all</Text>
            </Pressable>
            <Pressable onPress={openAddTask} hitSlop={8}>
              <Text style={styles.actionText}>Add task</Text>
            </Pressable>
          </View>
        </View>
      )}
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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  errorBlock: {
    gap: spacing.sm,
  },
  emptyBlock: {
    gap: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  actionText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  taskTitle: {
    ...typography.body,
    fontWeight: '500',
  },
  overdue: {
    ...typography.caption,
    color: colors.error,
    fontWeight: '600',
  },
});
