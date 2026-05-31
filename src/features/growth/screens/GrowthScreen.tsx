import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
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
import { HabitListItem } from '@/features/growth/components/HabitListItem';
import { HabitProgressSummary } from '@/features/growth/components/HabitProgressSummary';
import { SectionHeader } from '@/features/growth/components/SectionHeader';
import { useHabitsProgress } from '@/features/growth/hooks/useHabitsProgress';
import type { GrowthStackParamList } from '@/features/growth/navigation/types';
import {
  archiveHabit,
  markHabitDoneToday,
  undoHabitDoneToday,
} from '@/firebase/habits';
import { EmptyState, ErrorMessage } from '@/shared/components';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type GrowthNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<GrowthStackParamList, 'GrowthHome'>,
  BottomTabNavigationProp<MainTabParamList>
>;

export function GrowthScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<GrowthNavigation>();
  const { user } = useAuth();
  const {
    progressRows,
    completedTodayCount,
    totalActiveHabits,
    weeklyCompletionCount,
    isLoading,
    error,
    retry,
  } = useHabitsProgress();
  const [actionError, setActionError] = useState('');

  const handleToggleDone = async (habitId: string, isDoneToday: boolean) => {
    if (!user?.uid) return;
    setActionError('');
    try {
      if (isDoneToday) {
        await undoHabitDoneToday(user.uid, habitId);
      } else {
        await markHabitDoneToday(user.uid, habitId);
      }
    } catch (err) {
      setActionError(getFirestoreErrorMessage(err));
    }
  };

  const handleArchive = async (habitId: string) => {
    if (!user?.uid) return;
    setActionError('');
    try {
      await archiveHabit(user.uid, habitId);
    } catch (err) {
      setActionError(getFirestoreErrorMessage(err));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Growth</Text>
        <Pressable
          onPress={() => navigation.navigate('HabitForm', {})}
          hitSlop={8}
        >
          <Text style={styles.subtitle}>Add habit</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {actionError ? <ErrorMessage message={actionError} /> : null}

        {error ? (
          <View style={styles.centered}>
            <ErrorMessage message={error} />
            <Pressable onPress={retry} hitSlop={8}>
              <Text style={styles.link}>Retry</Text>
            </Pressable>
          </View>
        ) : isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Loading habits…</Text>
          </View>
        ) : (
          <>
            <HabitProgressSummary
              completedTodayCount={completedTodayCount}
              totalActiveHabits={totalActiveHabits}
              weeklyCompletionCount={weeklyCompletionCount}
            />

            <SectionHeader title="Active habits" />
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
                  onArchive={() => handleArchive(row.habit.id)}
                />
              ))
            )}
          </>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
  },
  centered: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  link: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
});
