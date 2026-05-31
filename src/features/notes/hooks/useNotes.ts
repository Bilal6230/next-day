import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/app/providers/AuthProvider';
import { subscribeToNotes } from '@/firebase/notes';
import type { Note, NoteListFilter } from '@/features/notes/types';
import { filterNotes } from '@/features/notes/utils/filter';
import { sortNotes } from '@/features/notes/utils/sort';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

type UseNotesResult = {
  notes: Note[];
  isLoading: boolean;
  error: string;
  retry: () => void;
};

export function useNotes(
  statusFilter: NoteListFilter,
  search: string,
): UseNotesResult {
  const { user } = useAuth();
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setError('');
    setIsLoading(true);
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setAllNotes([]);
      setIsLoading(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    const unsubscribe = subscribeToNotes(
      user.uid,
      (nextNotes) => {
        setAllNotes(nextNotes);
        setIsLoading(false);
        setError('');
      },
      (err) => {
        setError(getFirestoreErrorMessage(err));
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.uid, retryCount]);

  const notes = useMemo(
    () => sortNotes(filterNotes(allNotes, statusFilter, search)),
    [allNotes, statusFilter, search],
  );

  return { notes, isLoading, error, retry };
}
