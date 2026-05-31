import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/app/providers/AuthProvider';
import { subscribeToNotes } from '@/firebase/notes';
import type { Note } from '@/features/notes/types';
import { selectQuickNote } from '@/features/notes/utils/sort';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

type UseQuickNoteResult = {
  note: Note | null;
  isLoading: boolean;
  error: string;
  retry: () => void;
};

export function useQuickNote(): UseQuickNoteResult {
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

  const note = useMemo(() => selectQuickNote(allNotes), [allNotes]);

  return { note, isLoading, error, retry };
}
