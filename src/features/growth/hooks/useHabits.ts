import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/app/providers/AuthProvider';
import { subscribeToHabits } from '@/firebase/habits';
import type { Habit } from '@/features/growth/types';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

type UseHabitsResult = {
  habits: Habit[];
  isLoading: boolean;
  error: string;
  retry: () => void;
};

export function useHabits(): UseHabitsResult {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
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
      setHabits([]);
      setIsLoading(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    const unsubscribe = subscribeToHabits(
      user.uid,
      (nextHabits) => {
        setHabits(nextHabits);
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

  return { habits, isLoading, error, retry };
}
