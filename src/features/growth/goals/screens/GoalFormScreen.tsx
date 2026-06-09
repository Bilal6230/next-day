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
  GoalForm,
  type GoalFormValues,
} from '@/features/growth/goals/components/GoalForm';
import type { GrowthStackParamList } from '@/features/growth/navigation/types';
import type { GoalCategory, GoalStatus } from '@/features/growth/goals/types';
import { timestampToDate } from '@/features/growth/goals/utils/dates';
import {
  getFirstGoalFieldError,
  validateCreateGoalInput,
  type GoalFieldErrors,
} from '@/features/growth/goals/utils/validation';
import {
  archiveGoal,
  createGoal,
  getGoal,
  markGoalActive,
  markGoalCompleted,
  updateGoal,
} from '@/firebase/goals';
import { Button, ErrorMessage, Screen } from '@/shared/components';
import { useActionLock } from '@/shared/hooks/useActionLock';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type GoalFormRoute = RouteProp<GrowthStackParamList, 'GoalForm'>;
type GoalFormNavigation = NativeStackNavigationProp<
  GrowthStackParamList,
  'GoalForm'
>;

const DEFAULT_VALUES: GoalFormValues = {
  title: '',
  description: '',
  category: 'personal',
  progressPercent: 0,
  targetDate: null,
};

export function GoalFormScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<GoalFormNavigation>();
  const route = useRoute<GoalFormRoute>();
  const { user } = useAuth();
  const goalId = route.params?.goalId;
  const isEdit = Boolean(goalId);

  const [values, setValues] = useState<GoalFormValues>(DEFAULT_VALUES);
  const [goalStatus, setGoalStatus] = useState<GoalStatus>('active');
  const [fieldErrors, setFieldErrors] = useState<GoalFieldErrors>({});
  const [formError, setFormError] = useState('');
  const { busy: loading, runLocked } = useActionLock();
  const [loadingGoal, setLoadingGoal] = useState(isEdit);

  useEffect(() => {
    if (!goalId || !user?.uid) {
      setLoadingGoal(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const goal = await getGoal(user.uid, goalId);
        if (cancelled) return;
        if (!goal) {
          setFormError('Goal not found.');
          setLoadingGoal(false);
          return;
        }
        setGoalStatus(goal.status);
        setValues({
          title: goal.title,
          description: goal.description ?? '',
          category: goal.category,
          progressPercent: goal.progressPercent,
          targetDate: timestampToDate(goal.targetDate),
        });
      } catch (err) {
        if (!cancelled) setFormError(getFirestoreErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingGoal(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [goalId, user?.uid]);

  const buildInput = () => ({
    title: values.title,
    description: values.description || null,
    category: values.category,
    progressPercent: values.progressPercent,
    targetDate: values.targetDate,
  });

  const handleSave = () => {
    if (!user?.uid) return;

    const errors = validateCreateGoalInput(buildInput());
    setFieldErrors(errors);
    setFormError('');
    if (getFirstGoalFieldError(errors)) return;

    runLocked(async () => {
      try {
        if (isEdit && goalId) {
          await updateGoal(user.uid, goalId, buildInput());
        } else {
          await createGoal(user.uid, buildInput());
        }
        navigation.goBack();
      } catch (err) {
        setFormError(getFirestoreErrorMessage(err));
      }
    });
  };

  const handleMarkComplete = () => {
    if (!user?.uid || !goalId) return;
    runLocked(async () => {
      setFormError('');
      try {
        await markGoalCompleted(user.uid, goalId);
        navigation.goBack();
      } catch (err) {
        setFormError(getFirestoreErrorMessage(err));
      }
    });
  };

  const handleMarkActive = () => {
    if (!user?.uid || !goalId) return;
    runLocked(async () => {
      setFormError('');
      try {
        await markGoalActive(user.uid, goalId);
        navigation.goBack();
      } catch (err) {
        setFormError(getFirestoreErrorMessage(err));
      }
    });
  };

  const handleArchive = () => {
    if (!user?.uid || !goalId) return;
    Alert.alert('Archive goal?', 'This goal will be hidden from active lists.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        onPress: () => {
          runLocked(async () => {
            setFormError('');
            try {
              await archiveGoal(user.uid, goalId);
              navigation.goBack();
            } catch (err) {
              setFormError(getFirestoreErrorMessage(err));
            }
          });
        },
      },
    ]);
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{isEdit ? 'Edit goal' : 'New goal'}</Text>
      </View>

      {loadingGoal ? (
        <Text style={styles.loading}>Loading goal…</Text>
      ) : (
        <>
          <GoalForm
            values={values}
            fieldErrors={fieldErrors}
            onChange={setValues}
          />
          {formError ? <ErrorMessage message={formError} /> : null}
          <Button title="Save" onPress={handleSave} loading={loading} />
          {isEdit ? (
            <View style={styles.actions}>
              {goalStatus === 'active' ? (
                <Button
                  title="Mark complete"
                  variant="secondary"
                  onPress={handleMarkComplete}
                  disabled={loading}
                />
              ) : null}
              {goalStatus === 'completed' ? (
                <Button
                  title="Mark active"
                  variant="secondary"
                  onPress={handleMarkActive}
                  disabled={loading}
                />
              ) : null}
              {goalStatus !== 'archived' ? (
                <Button
                  title="Archive goal"
                  variant="ghost"
                  onPress={handleArchive}
                  disabled={loading}
                />
              ) : null}
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
  actions: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
});
