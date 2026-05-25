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
import { TODAY_HABIT_ROWS_LIMIT } from '@/features/growth/constants';
import { useHabitsProgress } from '@/features/growth/hooks/useHabitsProgress';
import { Card, EmptyState, ErrorMessage } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

const ACCENT = '#34D399';

export function HabitProgressCard() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const {
    progressRows,
    completedTodayCount,
    totalActiveHabits,
    isLoading,
    error,
    retry,
  } = useHabitsProgress();

  const preview = progressRows.slice(0, TODAY_HABIT_ROWS_LIMIT);

  const openGrowth = () => {
    navigation.navigate('Growth', { screen: 'GrowthHome' });
  };

  const openAddHabit = () => {
    navigation.navigate('Growth', { screen: 'HabitForm', params: {} });
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.accent, { backgroundColor: ACCENT }]} />
        <Text style={styles.title}>Habit Progress</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.loadingText}>Loading habits…</Text>
        </View>
      ) : error ? (
        <View style={styles.block}>
          <ErrorMessage message={error} />
          <View style={styles.actions}>
            <Pressable onPress={retry} hitSlop={8}>
              <Text style={styles.action}>Retry</Text>
            </Pressable>
            <Pressable onPress={openGrowth} hitSlop={8}>
              <Text style={styles.action}>Open Growth</Text>
            </Pressable>
          </View>
        </View>
      ) : totalActiveHabits === 0 ? (
        <View style={styles.block}>
          <EmptyState
            title="No habits tracked yet"
            description="Build streaks in Growth when ready."
          />
          <View style={styles.actions}>
            <Pressable onPress={openAddHabit} hitSlop={8}>
              <Text style={styles.action}>Add habit</Text>
            </Pressable>
            <Pressable onPress={openGrowth} hitSlop={8}>
              <Text style={styles.action}>Open Growth</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.block}>
          <Text style={styles.summary}>
            {completedTodayCount} / {totalActiveHabits} habits completed today
          </Text>
          <View style={styles.list}>
            {preview.map((row) => (
              <View key={row.habit.id} style={styles.row}>
                <Text style={styles.rowTitle} numberOfLines={1}>
                  {row.isDoneToday ? '✓ ' : ''}
                  {row.habit.title}
                </Text>
                <Text style={styles.streak}>
                  Streak {row.habit.currentStreak}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.actions}>
            {totalActiveHabits > 0 ? (
              <Pressable onPress={openGrowth} hitSlop={8}>
                <Text style={styles.action}>View all</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={openAddHabit} hitSlop={8}>
              <Text style={styles.action}>Add habit</Text>
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
  block: {
    gap: spacing.sm,
  },
  summary: {
    ...typography.body,
    fontWeight: '500',
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    gap: 2,
  },
  rowTitle: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  streak: {
    ...typography.caption,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  action: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
});
