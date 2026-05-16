import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CompositeNavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { MainTabParamList } from '@/app/navigation/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { TaskFilterChips } from '@/features/tasks/components/TaskFilterChips';
import { TaskListItem } from '@/features/tasks/components/TaskListItem';
import { useTasks } from '@/features/tasks/hooks/useTasks';
import type { TasksStackParamList } from '@/features/tasks/navigation/types';
import type { TaskListFilter } from '@/features/tasks/types';
import {
  archiveTask,
  deleteTask,
  markTaskCompleted,
  markTaskPending,
} from '@/firebase/tasks';
import { Button, EmptyState, ErrorMessage } from '@/shared/components';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type TasksListRoute = RouteProp<TasksStackParamList, 'TasksList'>;
type TasksListNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<TasksStackParamList, 'TasksList'>,
  BottomTabNavigationProp<MainTabParamList>
>;

const EMPTY_COPY: Record<
  TaskListFilter,
  { title: string; description: string }
> = {
  all: {
    title: 'No tasks yet',
    description: 'Add your first task to get started.',
  },
  today: {
    title: 'Nothing due today',
    description: 'You are clear for now — no overdue items either.',
  },
  completed: {
    title: 'No completed tasks',
    description: 'Finished tasks will appear here.',
  },
  archived: {
    title: 'No archived tasks',
    description: 'Archived tasks will appear here.',
  },
};

export function TasksScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TasksListNavigation>();
  const route = useRoute<TasksListRoute>();
  const { user } = useAuth();
  const initialFilter = route.params?.filter ?? 'all';
  const [filter, setFilter] = useState<TaskListFilter>(initialFilter);
  const [actionError, setActionError] = useState('');

  const { tasks, isLoading, error, retry } = useTasks(filter);

  useEffect(() => {
    if (route.params?.filter) {
      setFilter(route.params.filter);
    }
  }, [route.params?.filter]);

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    if (!user?.uid) return;
    setActionError('');
    try {
      if (completed) {
        await markTaskPending(user.uid, taskId);
      } else {
        await markTaskCompleted(user.uid, taskId);
      }
    } catch (err) {
      setActionError(getFirestoreErrorMessage(err));
    }
  };

  const handleArchive = async (taskId: string) => {
    if (!user?.uid) return;
    setActionError('');
    try {
      await archiveTask(user.uid, taskId);
    } catch (err) {
      setActionError(getFirestoreErrorMessage(err));
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!user?.uid) return;
    setActionError('');
    try {
      await deleteTask(user.uid, taskId);
    } catch (err) {
      setActionError(getFirestoreErrorMessage(err));
    }
  };

  const emptyCopy = EMPTY_COPY[filter];

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Pressable
          onPress={() => navigation.navigate('TaskForm', {})}
          style={styles.addButton}
        >
          <Text style={styles.addLabel}>Add</Text>
        </Pressable>
      </View>

      <View style={styles.chips}>
        <TaskFilterChips value={filter} onChange={setFilter} />
      </View>

      {actionError ? (
        <View style={styles.banner}>
          <ErrorMessage message={actionError} />
        </View>
      ) : null}

      {error ? (
        <View style={styles.centered}>
          <ErrorMessage message={error} />
          <Button title="Retry" onPress={retry} variant="secondary" />
        </View>
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading tasks…</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + spacing.xl },
            tasks.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title={emptyCopy.title}
              description={emptyCopy.description}
            />
          }
          renderItem={({ item }) => (
            <TaskListItem
              task={item}
              onPress={() =>
                navigation.navigate('TaskForm', { taskId: item.id })
              }
              onToggleComplete={() =>
                handleToggleComplete(item.id, item.status === 'completed')
              }
              onArchive={() => handleArchive(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
  },
  addButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addLabel: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  chips: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  banner: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
