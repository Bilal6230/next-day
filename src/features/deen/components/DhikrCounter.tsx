import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type DhikrCounterProps = {
  title: string;
  phrase: string;
  transliteration: string | null;
  translation: string | null;
  count: number;
  targetCount: number;
  progressPercent: number;
  completed: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onResetToday: () => void;
  resetting?: boolean;
};

export function DhikrCounter({
  title,
  phrase,
  transliteration,
  translation,
  count,
  targetCount,
  progressPercent,
  completed,
  onIncrement,
  onDecrement,
  onResetToday,
  resetting = false,
}: DhikrCounterProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.phrase}>{phrase}</Text>
      {transliteration ? (
        <Text style={styles.transliteration}>{transliteration}</Text>
      ) : null}
      {translation ? (
        <Text style={styles.translation}>{translation}</Text>
      ) : null}

      <View style={styles.countBlock}>
        <Text style={styles.count}>
          {count} / {targetCount}
        </Text>
        <Text style={styles.percent}>{progressPercent}%</Text>
        {completed ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Completed</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progressPercent}%` }]} />
      </View>

      <Pressable
        onPress={onIncrement}
        style={({ pressed }) => [
          styles.tapArea,
          pressed && styles.tapAreaPressed,
        ]}
      >
        <Text style={styles.tapLabel}>+1</Text>
      </Pressable>

      <View style={styles.actions}>
        <Button
          title="Undo"
          variant="secondary"
          onPress={onDecrement}
          disabled={count <= 0}
        />
        <Button
          title="Reset today"
          variant="ghost"
          onPress={onResetToday}
          loading={resetting}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    ...typography.heading,
    textAlign: 'center',
  },
  phrase: {
    ...typography.title,
    textAlign: 'center',
    color: colors.textPrimary,
    lineHeight: 40,
  },
  transliteration: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
  },
  translation: {
    ...typography.bodySmall,
    textAlign: 'center',
    color: colors.textMuted,
  },
  countBlock: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  count: {
    ...typography.title,
    color: colors.primary,
  },
  percent: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  badge: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    marginTop: spacing.xs,
  },
  badgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  tapArea: {
    minHeight: 120,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  tapAreaPressed: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.primary,
  },
  tapLabel: {
    ...typography.title,
    color: colors.primary,
  },
  actions: {
    gap: spacing.md,
  },
});
