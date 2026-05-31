import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Habit } from '@/features/growth/types';
import { Card } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type HabitListItemProps = {
  habit: Habit;
  isDoneToday: boolean;
  onPress: () => void;
  onToggleDone: () => void;
  onArchive: () => void;
};

export function HabitListItem({
  habit,
  isDoneToday,
  onPress,
  onToggleDone,
  onArchive,
}: HabitListItemProps) {
  const handleArchive = () => {
    Alert.alert('Archive habit?', 'You can add a new habit anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Archive', onPress: onArchive },
    ]);
  };

  return (
    <Card style={styles.card}>
      <Pressable onPress={onPress} style={styles.main}>
        <Pressable
          onPress={onToggleDone}
          style={[styles.checkbox, isDoneToday && styles.checkboxDone]}
          hitSlop={8}
        >
          {isDoneToday ? <Text style={styles.checkmark}>✓</Text> : null}
        </Pressable>
        <View style={styles.content}>
          <Text
            style={[styles.title, isDoneToday && styles.titleDone]}
            numberOfLines={1}
          >
            {habit.title}
          </Text>
          {habit.description ? (
            <Text style={styles.description} numberOfLines={1}>
              {habit.description}
            </Text>
          ) : null}
          <Text style={styles.meta}>
            Streak {habit.currentStreak} · Best {habit.bestStreak}
            {habit.lastCompletedDateKey
              ? ` · Last ${habit.lastCompletedDateKey}`
              : ''}
          </Text>
        </View>
      </Pressable>
      <Pressable onPress={handleArchive} style={styles.archive}>
        <Text style={styles.archiveText}>Archive</Text>
      </Pressable>
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
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkmark: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
  },
  titleDone: {
    color: colors.textMuted,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  archive: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  archiveText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },
});
