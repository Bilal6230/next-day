import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '@/app/providers/AuthProvider';
import {
  TaskForm,
  type TaskFormValues,
} from '@/features/tasks/components/TaskForm';
import type { TasksStackParamList } from '@/features/tasks/navigation/types';
import {
  validateCreateTaskInput,
  validateUpdateTaskInput,
  type TaskFieldErrors,
} from '@/features/tasks/utils/validation';
import { timestampToDate } from '@/features/tasks/utils/dates';
import {
  archiveTask,
  createTask,
  deleteTask,
  getTask,
  updateTask,
} from '@/firebase/tasks';
import { Button, ErrorMessage, Screen } from '@/shared/components';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type TaskFormRoute = RouteProp<TasksStackParamList, 'TaskForm'>;
type TaskFormNavigation = NativeStackNavigationProp<
  TasksStackParamList,
  'TaskForm'
>;

const DEFAULT_VALUES: TaskFormValues = {
  title: '',
  notes: '',
  priority: 'medium',
  dueDate: null,
};

export function TaskFormScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<TaskFormNavigation>();
  const route = useRoute<TaskFormRoute>();
  const { user } = useAuth();
  const taskId = route.params?.taskId;
  const isEdit = Boolean(taskId);

  const [values, setValues] = useState<TaskFormValues>(DEFAULT_VALUES);
  const [fieldErrors, setFieldErrors] = useState<TaskFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState(isEdit);

  useEffect(() => {
    if (!taskId || !user?.uid) {
      setLoadingTask(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const task = await getTask(user.uid, taskId);
        if (cancelled) return;
        if (!task) {
          setFormError('Task not found.');
          setLoadingTask(false);
          return;
        }
        setValues({
          title: task.title,
          notes: task.notes ?? '',
          priority: task.priority,
          dueDate: timestampToDate(task.dueDate),
        });
      } catch (err) {
        if (!cancelled) {
          setFormError(getFirestoreErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoadingTask(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [taskId, user?.uid]);

  const handleSave = async () => {
    if (!user?.uid) return;

    const input = {
      title: values.title,
      notes: values.notes || null,
      priority: values.priority,
      dueDate: values.dueDate,
    };

    const errors = isEdit
      ? validateUpdateTaskInput(input)
      : validateCreateTaskInput(input);
    setFieldErrors(errors);
    setFormError('');

    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      if (isEdit && taskId) {
        await updateTask(user.uid, taskId, input);
      } else {
        await createTask(user.uid, input);
      }
      navigation.goBack();
    } catch (err) {
      setFormError(getFirestoreErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = () => {
    if (!user?.uid || !taskId) return;
    Alert.alert('Archive task?', 'You can find it under the Archived filter.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        onPress: async () => {
          setLoading(true);
          try {
            await archiveTask(user.uid, taskId);
            navigation.goBack();
          } catch (err) {
            setFormError(getFirestoreErrorMessage(err));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    if (!user?.uid || !taskId) return;
    Alert.alert(
      'Delete permanently?',
      'This task will be removed forever. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete permanently',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteTask(user.uid, taskId);
              navigation.goBack();
            } catch (err) {
              setFormError(getFirestoreErrorMessage(err));
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{isEdit ? 'Edit task' : 'New task'}</Text>
      </View>

      {loadingTask ? (
        <Text style={styles.loading}>Loading task…</Text>
      ) : (
        <>
          <TaskForm
            values={values}
            fieldErrors={fieldErrors}
            onChange={setValues}
          />
          {formError ? <ErrorMessage message={formError} /> : null}
          <Button title="Save" onPress={handleSave} loading={loading} />
          {isEdit ? (
            <View style={styles.dangerZone}>
              <Button
                title="Archive task"
                variant="secondary"
                onPress={handleArchive}
                disabled={loading}
              />
              <Button
                title="Delete permanently"
                variant="ghost"
                onPress={handleDelete}
                disabled={loading}
                style={styles.deleteButton}
              />
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  back: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.title,
  },
  loading: {
    ...typography.body,
    color: colors.textMuted,
  },
  dangerZone: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  deleteButton: {
    alignSelf: 'center',
  },
});
