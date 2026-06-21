import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AZKAR_PHRASE_PREVIEW_LENGTH } from '@/features/deen/azkar/constants';
import type { AzkarDashboardRow } from '@/features/deen/azkar/types';
import { Card } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type AzkarListItemProps = {
  row: AzkarDashboardRow;
  onToggleDone: () => void;
  onEdit?: () => void;
};

function phrasePreview(phrase: string): string {
  if (phrase.length <= AZKAR_PHRASE_PREVIEW_LENGTH) return phrase;
  return `${phrase.slice(0, AZKAR_PHRASE_PREVIEW_LENGTH)}…`;
}

export function AzkarListItem({ row, onToggleDone, onEdit }: AzkarListItemProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.main}>
        <Pressable
          onPress={onToggleDone}
          style={[styles.checkbox, row.completed && styles.checkboxDone]}
          hitSlop={8}
        >
          {row.completed ? <Text style={styles.checkmark}>✓</Text> : null}
        </Pressable>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text
              style={[styles.title, row.completed && styles.titleDone]}
              numberOfLines={1}
            >
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
          {row.transliteration ? (
            <Text style={styles.meta} numberOfLines={1}>
              {row.transliteration}
            </Text>
          ) : null}
          {row.translation ? (
            <Text style={styles.meta} numberOfLines={1}>
              {row.translation}
            </Text>
          ) : null}
        </View>
      </View>
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
  titleDone: {
    color: colors.textMuted,
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
