import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { FILTER_LABELS } from '@/features/tasks/constants';
import type { TaskListFilter } from '@/features/tasks/types';
import { colors, radius, spacing, typography } from '@/shared/theme';

const FILTERS: TaskListFilter[] = ['all', 'today', 'completed', 'archived'];

type TaskFilterChipsProps = {
  value: TaskListFilter;
  onChange: (filter: TaskListFilter) => void;
};

export function TaskFilterChips({ value, onChange }: TaskFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {FILTERS.map((filter) => {
        const selected = value === filter;
        return (
          <Pressable
            key={filter}
            onPress={() => onChange(filter)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {FILTER_LABELS[filter]}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
});
