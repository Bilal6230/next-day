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
import { NOTE_BODY_PREVIEW_LENGTH } from '@/features/notes/constants';
import { useQuickNote } from '@/features/notes/hooks/useQuickNote';
import { Card, EmptyState, ErrorMessage } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

const ACCENT = '#F472B6';

function truncateBody(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) return '';
  if (trimmed.length <= NOTE_BODY_PREVIEW_LENGTH) return trimmed;
  return `${trimmed.slice(0, NOTE_BODY_PREVIEW_LENGTH)}…`;
}

export function QuickNoteCard() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { note, isLoading, error, retry } = useQuickNote();

  const openNotes = () => {
    navigation.navigate('More', { screen: 'NotesList' });
  };

  const openAddNote = () => {
    navigation.navigate('More', { screen: 'NoteForm', params: {} });
  };

  const openEditNote = () => {
    if (!note) return;
    navigation.navigate('More', {
      screen: 'NoteForm',
      params: { noteId: note.id },
    });
  };

  const bodyPreview = note ? truncateBody(note.body) : '';

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.accent, { backgroundColor: ACCENT }]} />
        <Text style={styles.title}>Quick Note</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.loadingText}>Loading note…</Text>
        </View>
      ) : error ? (
        <View style={styles.block}>
          <ErrorMessage message={error} />
          <View style={styles.actions}>
            <Pressable onPress={retry} hitSlop={8}>
              <Text style={styles.action}>Retry</Text>
            </Pressable>
            <Pressable onPress={openNotes} hitSlop={8}>
              <Text style={styles.action}>Open Notes</Text>
            </Pressable>
          </View>
        </View>
      ) : !note ? (
        <View style={styles.block}>
          <EmptyState
            title="No note saved"
            description="Capture a thought for today."
          />
          <View style={styles.actions}>
            <Pressable onPress={openAddNote} hitSlop={8}>
              <Text style={styles.action}>Add note</Text>
            </Pressable>
            <Pressable onPress={openNotes} hitSlop={8}>
              <Text style={styles.action}>Open Notes</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.block}>
          <Pressable onPress={openEditNote} style={styles.preview}>
            <View style={styles.previewHeader}>
              <Text style={styles.noteTitle} numberOfLines={1}>
                {note.title}
              </Text>
              {note.pinned ? (
                <Text style={styles.pinned}>Pinned</Text>
              ) : null}
            </View>
            {bodyPreview ? (
              <Text style={styles.noteBody} numberOfLines={3}>
                {bodyPreview}
              </Text>
            ) : null}
          </Pressable>
          <View style={styles.actions}>
            <Pressable onPress={openNotes} hitSlop={8}>
              <Text style={styles.action}>Open Notes</Text>
            </Pressable>
            <Pressable onPress={openAddNote} hitSlop={8}>
              <Text style={styles.action}>Add note</Text>
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
  preview: {
    gap: spacing.xs,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  noteTitle: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
  pinned: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  noteBody: {
    ...typography.bodySmall,
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
