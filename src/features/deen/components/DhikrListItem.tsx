import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DHIKR_PHRASE_PREVIEW_LENGTH } from '@/features/deen/constants';
import type { DhikrDashboardRow } from '@/features/deen/types';
import { getDhikrProgressPercent } from '@/features/deen/utils/progress';
import { Card } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type DhikrListItemProps = {
  row: DhikrDashboardRow;
  onPress: () => void;
  onEdit?: () => void;
};

function phrasePreview(phrase: string): string {
  if (phrase.length <= DHIKR_PHRASE_PREVIEW_LENGTH) return phrase;
  return `${phrase.slice(0, DHIKR_PHRASE_PREVIEW_LENGTH)}…`;
}

export function DhikrListItem({ row, onPress, onEdit }: DhikrListItemProps) {
  const progressPercent = getDhikrProgressPercent(row.count, row.targetCount);

  return (
    <Card style={styles.card}>
      <Pressable onPress={onPress} style={styles.main}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {row.title}
          </Text>
          {row.completed ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Completed</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.phrase} numberOfLines={1}>
          {phrasePreview(row.phrase)}
        </Text>
        <Text style={styles.meta}>
          {row.count} / {row.targetCount} · {progressPercent}%
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progressPercent}%` }]} />
        </View>
      </Pressable>
      {row.canEdit && onEdit ? (
        <Pressable onPress={onEdit} style={styles.edit}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  main: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  phrase: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  edit: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
  },
  editText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },
});
