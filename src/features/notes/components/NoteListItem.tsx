import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NOTE_BODY_PREVIEW_LENGTH } from '@/features/notes/constants';
import type { Note } from '@/features/notes/types';
import { Card } from '@/shared/components';
import { colors, radius, spacing, typography } from '@/shared/theme';

function truncateBody(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return '';
  if (trimmed.length <= NOTE_BODY_PREVIEW_LENGTH) return trimmed;
  return `${trimmed.slice(0, NOTE_BODY_PREVIEW_LENGTH)}…`;
}

type NoteListItemProps = {
  note: Note;
  onPress: () => void;
  onTogglePin: () => void;
};

export function NoteListItem({ note, onPress, onTogglePin }: NoteListItemProps) {
  const bodyPreview = truncateBody(note.body);

  return (
    <Card style={styles.card}>
      <Pressable onPress={onPress} style={styles.main}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {note.title}
          </Text>
          {note.pinned ? <Text style={styles.pinnedBadge}>Pinned</Text> : null}
        </View>
        {bodyPreview ? (
          <Text style={styles.body} numberOfLines={2}>
            {bodyPreview}
          </Text>
        ) : null}
        {note.tags.length > 0 ? (
          <View style={styles.tags}>
            {note.tags.slice(0, 4).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {note.tags.length > 4 ? (
              <Text style={styles.moreTags}>+{note.tags.length - 4}</Text>
            ) : null}
          </View>
        ) : null}
      </Pressable>
      {note.status === 'active' ? (
        <Pressable onPress={onTogglePin} hitSlop={8} style={styles.pinAction}>
          <Text style={styles.pinText}>{note.pinned ? 'Unpin' : 'Pin'}</Text>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
  pinnedBadge: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  body: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  tag: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  tagText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  moreTags: {
    ...typography.caption,
    color: colors.textMuted,
  },
  pinAction: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
  },
  pinText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
});
