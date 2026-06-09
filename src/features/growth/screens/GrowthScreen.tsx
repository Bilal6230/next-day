import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { MainTabParamList } from '@/app/navigation/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { GoalFilterChips } from '@/features/growth/goals/components/GoalFilterChips';
import { GoalListItem } from '@/features/growth/goals/components/GoalListItem';
import { useGoals } from '@/features/growth/goals/hooks/useGoals';
import type { GoalListFilter } from '@/features/growth/goals/types';
import { HabitListItem } from '@/features/growth/components/HabitListItem';
import { HabitProgressSummary } from '@/features/growth/components/HabitProgressSummary';
import { useHabitsProgress } from '@/features/growth/hooks/useHabitsProgress';
import type { GrowthStackParamList } from '@/features/growth/navigation/types';
import {
  archiveHabit,
  markHabitDoneToday,
  undoHabitDoneToday,
} from '@/firebase/habits';
import { Button, EmptyState, ErrorMessage, SectionHeader } from '@/shared/components';
import { useActionLock } from '@/shared/hooks/useActionLock';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type GrowthNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<GrowthStackParamList, 'GrowthHome'>,
  BottomTabNavigationProp<MainTabParamList>
>;

const GOAL_EMPTY_COPY: Record<
  GoalListFilter,
  { title: string; description: string }
> = {
  active: {
    title: 'No active goals',
    description: 'Set a goal to track progress over time.',
  },
  completed: {
    title: 'No completed goals',
    description: 'Finished goals will appear here.',
  },
  archived: {
    title: 'No archived goals',
    description: 'Archived goals will appear here.',
  },
};

export function GrowthScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<GrowthNavigation>();
  const { user } = useAuth();
  const [goalFilter, setGoalFilter] = useState<GoalListFilter>('active');
  const [habitActionError, setHabitActionError] = useState('');
  const { runLocked } = useActionLock();

  const {
    progressRows,
    completedTodayCount,
    totalActiveHabits,
    weeklyCompletionCount,
    isLoading: habitsLoading,
    error: habitsError,
    retry: retryHabits,
  } = useHabitsProgress();

  const {
    goals,
    isLoading: goalsLoading,
    error: goalsError,
    retry: retryGoals,
  } = useGoals(goalFilter);

  const goalEmptyCopy = GOAL_EMPTY_COPY[goalFilter];

  const handleToggleDone = (habitId: string, isDoneToday: boolean) => {
    if (!user?.uid) return;
    runLocked(async () => {
      setHabitActionError('');
      try {
        if (isDoneToday) {
          await undoHabitDoneToday(user.uid, habitId);
        } else {
          await markHabitDoneToday(user.uid, habitId);
        }
      } catch (err) {
        setHabitActionError(getFirestoreErrorMessage(err));
      }
    });
  };

  const handleArchiveHabit = (habitId: string) => {
    if (!user?.uid) return;
    runLocked(async () => {
      setHabitActionError('');
      try {
        await archiveHabit(user.uid, habitId);
      } catch (err) {
        setHabitActionError(getFirestoreErrorMessage(err));
      }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Growth</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {habitActionError ? <ErrorMessage message={habitActionError} /> : null}

        <SectionHeader
          title="Habits"
          actionLabel="Add habit"
          onAction={() => navigation.navigate('HabitForm', {})}
        />

        {habitsError ? (
          <View style={styles.sectionBlock}>
            <ErrorMessage message={habitsError} />
            <Button title="Retry" onPress={retryHabits} variant="secondary" />
          </View>
        ) : habitsLoading ? (
          <View style={styles.sectionBlock}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={styles.loadingText}>Loading habits…</Text>
          </View>
        ) : (
          <>
            <HabitProgressSummary
              completedTodayCount={completedTodayCount}
              totalActiveHabits={totalActiveHabits}
              weeklyCompletionCount={weeklyCompletionCount}
            />
            {progressRows.length === 0 ? (
              <EmptyState
                title="No habits yet"
                description="Add a daily habit to start building streaks."
              />
            ) : (
              progressRows.map((row) => (
                <HabitListItem
                  key={row.habit.id}
                  habit={row.habit}
                  isDoneToday={row.isDoneToday}
                  onPress={() =>
                    navigation.navigate('HabitForm', { habitId: row.habit.id })
                  }
                  onToggleDone={() =>
                    handleToggleDone(row.habit.id, row.isDoneToday)
                  }
                  onArchive={() => handleArchiveHabit(row.habit.id)}
                />
              ))
            )}
          </>
        )}

        <View style={styles.sectionDivider} />

        <SectionHeader
          title="Goals"
          actionLabel="Add goal"
          onAction={() => navigation.navigate('GoalForm', {})}
        />

        <GoalFilterChips value={goalFilter} onChange={setGoalFilter} />

        {goalsError ? (
          <View style={styles.sectionBlock}>
            <ErrorMessage message={goalsError} />
            <Button title="Retry" onPress={retryGoals} variant="secondary" />
          </View>
        ) : goalsLoading ? (
          <View style={styles.sectionBlock}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={styles.loadingText}>Loading goals…</Text>
          </View>
        ) : goals.length === 0 ? (
          <EmptyState
            title={goalEmptyCopy.title}
            description={goalEmptyCopy.description}
          />
        ) : (
          goals.map((goal) => (
            <GoalListItem
              key={goal.id}
              goal={goal}
              onPress={() =>
                navigation.navigate('GoalForm', { goalId: goal.id })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
  },
  sectionBlock: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  sectionDivider: {
    height: spacing.lg,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
