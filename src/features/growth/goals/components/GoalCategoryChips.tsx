import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CATEGORY_LABELS, GOAL_CATEGORIES } from '@/features/growth/goals/constants';
import type { GoalCategory } from '@/features/growth/goals/types';
import { colors, radius, spacing, typography } from '@/shared/theme';

type GoalCategoryChipsProps = {
  value: GoalCategory;
  onChange: (category: GoalCategory) => void;
  error?: string;
};

export function GoalCategoryChips({
  value,
  onChange,
  error,
}: GoalCategoryChipsProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {GOAL_CATEGORIES.map((category) => {
          const selected = value === category;
          return (
            <Pressable
              key={category}
              onPress={() => onChange(category)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.label, selected && styles.labelSelected]}>
                {CATEGORY_LABELS[category]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  error: {
    ...typography.caption,
    color: colors.error,
  },
});
