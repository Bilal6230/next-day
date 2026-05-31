import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
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
import { NoteFilterChips } from '@/features/notes/components/NoteFilterChips';
import { NoteListItem } from '@/features/notes/components/NoteListItem';
import { NoteSearchBar } from '@/features/notes/components/NoteSearchBar';
import { useNotes } from '@/features/notes/hooks/useNotes';
import type { MoreStackParamList } from '@/features/more/navigation/types';
import type { NoteListFilter } from '@/features/notes/types';
import { setNotePinned } from '@/firebase/notes';
import { Button, EmptyState, ErrorMessage } from '@/shared/components';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type NotesNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<MoreStackParamList, 'NotesList'>,
  BottomTabNavigationProp<MainTabParamList>
>;

const EMPTY_COPY: Record<NoteListFilter, { title: string; description: string }> =
  {
    active: {
      title: 'No notes yet',
      description: 'Capture a thought or pin an important note.',
    },
    archived: {
      title: 'No archived notes',
      description: 'Archived notes will appear here.',
    },
  };

export function NotesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NotesNavigation>();
  const { user } = useAuth();
  const [filter, setFilter] = useState<NoteListFilter>('active');
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState('');

  const { notes, isLoading, error, retry } = useNotes(filter, search);
  const emptyCopy = EMPTY_COPY[filter];

  const handleTogglePin = async (noteId: string, pinned: boolean) => {
    if (!user?.uid) return;
    setActionError('');
    try {
      await setNotePinned(user.uid, noteId, !pinned);
    } catch (err) {
      setActionError(getFirestoreErrorMessage(err));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Notes</Text>
        <Pressable
          onPress={() => navigation.navigate('NoteForm', {})}
          style={styles.addButton}
        >
          <Text style={styles.addLabel}>Add</Text>
        </Pressable>
      </View>

      <View style={styles.controls}>
        <NoteSearchBar value={search} onChange={setSearch} />
        <NoteFilterChips value={filter} onChange={setFilter} />
      </View>

      {actionError ? (
        <View style={styles.banner}>
          <ErrorMessage message={actionError} />
        </View>
      ) : null}

      {error ? (
        <View style={styles.centered}>
          <ErrorMessage message={error} />
          <Button title="Retry" onPress={retry} variant="secondary" />
        </View>
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.loadingText}>Loading notes…</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + spacing.xl },
            notes.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title={emptyCopy.title}
              description={emptyCopy.description}
            />
          }
          renderItem={({ item }) => (
            <NoteListItem
              note={item}
              onPress={() =>
                navigation.navigate('NoteForm', { noteId: item.id })
              }
              onTogglePin={() => handleTogglePin(item.id, item.pinned)}
            />
          )}
        />
      )}
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
    gap: spacing.sm,
  },
  back: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.title,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addLabel: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  controls: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  banner: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
