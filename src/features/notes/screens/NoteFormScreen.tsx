import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '@/app/providers/AuthProvider';
import {
  NoteForm,
  type NoteFormValues,
} from '@/features/notes/components/NoteForm';
import type { MoreStackParamList } from '@/features/more/navigation/types';
import {
  normalizeTags,
  splitTagsInput,
  tagsToInput,
} from '@/features/notes/utils/tags';
import type { NoteStatus } from '@/features/notes/types';
import {
  getFirstNoteFieldError,
  validateCreateNoteInput,
  type NoteFieldErrors,
} from '@/features/notes/utils/validation';
import {
  archiveNote,
  createNote,
  deleteNote,
  getNote,
  updateNote,
} from '@/firebase/notes';
import { Button, ErrorMessage, Screen } from '@/shared/components';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type NoteFormRoute = RouteProp<MoreStackParamList, 'NoteForm'>;
type NoteFormNavigation = NativeStackNavigationProp<
  MoreStackParamList,
  'NoteForm'
>;

const DEFAULT_VALUES: NoteFormValues = {
  title: '',
  body: '',
  tags: '',
  pinned: false,
};

export function NoteFormScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NoteFormNavigation>();
  const route = useRoute<NoteFormRoute>();
  const { user } = useAuth();
  const noteId = route.params?.noteId;
  const isEdit = Boolean(noteId);

  const [values, setValues] = useState<NoteFormValues>(DEFAULT_VALUES);
  const [fieldErrors, setFieldErrors] = useState<NoteFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingNote, setLoadingNote] = useState(isEdit);
  const [noteStatus, setNoteStatus] = useState<NoteStatus>('active');

  useEffect(() => {
    if (!noteId || !user?.uid) {
      setLoadingNote(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const note = await getNote(user.uid, noteId);
        if (cancelled) return;
        if (!note) {
          setFormError('Note not found.');
          setLoadingNote(false);
          return;
        }
        setNoteStatus(note.status);
        setValues({
          title: note.title,
          body: note.body,
          tags: tagsToInput(note.tags),
          pinned: note.pinned,
        });
      } catch (err) {
        if (!cancelled) setFormError(getFirestoreErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingNote(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [noteId, user?.uid]);

  const buildInput = () => {
    const rawTags = splitTagsInput(values.tags);
    return {
      title: values.title,
      body: values.body,
      tags: normalizeTags(rawTags),
      pinned: noteStatus === 'archived' ? false : values.pinned,
    };
  };

  const validateForm = () => {
    const rawTags = splitTagsInput(values.tags);
    return validateCreateNoteInput({
      title: values.title,
      body: values.body,
      tags: rawTags,
      pinned: values.pinned,
    });
  };

  const handleSave = async () => {
    if (!user?.uid) return;

    const errors = validateForm();
    setFieldErrors(errors);
    setFormError('');
    if (getFirstNoteFieldError(errors)) return;

    const input = buildInput();
    setLoading(true);
    try {
      if (isEdit && noteId) {
        await updateNote(user.uid, noteId, input);
      } else {
        await createNote(user.uid, input);
      }
      navigation.goBack();
    } catch (err) {
      setFormError(getFirestoreErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = () => {
    if (!user?.uid || !noteId) return;
    Alert.alert('Archive note?', 'This note will be hidden from active lists.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        onPress: async () => {
          setLoading(true);
          try {
            await archiveNote(user.uid, noteId);
            navigation.goBack();
          } catch (err) {
            setFormError(getFirestoreErrorMessage(err));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const confirmPermanentDelete = () => {
    if (!user?.uid || !noteId) return;
    Alert.alert(
      'Delete forever?',
      'This note will be permanently removed. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteNote(user.uid, noteId);
              navigation.goBack();
            } catch (err) {
              setFormError(getFirestoreErrorMessage(err));
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleDelete = () => {
    if (!user?.uid || !noteId) return;
    Alert.alert(
      'Delete note permanently?',
      'You are about to permanently delete this note from your account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: confirmPermanentDelete,
        },
      ],
    );
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{isEdit ? 'Edit note' : 'New note'}</Text>
      </View>

      {loadingNote ? (
        <Text style={styles.loading}>Loading note…</Text>
      ) : (
        <>
          <NoteForm
            values={values}
            fieldErrors={fieldErrors}
            onChange={setValues}
            pinDisabled={noteStatus === 'archived'}
          />
          {formError ? <ErrorMessage message={formError} /> : null}
          <Button title="Save" onPress={handleSave} loading={loading} />
          {isEdit ? (
            <View style={styles.dangerZone}>
              <Button
                title="Archive note"
                variant="secondary"
                onPress={handleArchive}
                disabled={loading}
              />
              <Button
                title="Delete permanently"
                variant="ghost"
                onPress={handleDelete}
                disabled={loading}
                style={styles.deleteButton}
              />
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  back: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.title,
  },
  loading: {
    ...typography.body,
    color: colors.textMuted,
  },
  dangerZone: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  deleteButton: {
    alignSelf: 'center',
  },
});
