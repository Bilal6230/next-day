import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/app/providers/AuthProvider';
import { filterGoalsByStatus } from '@/features/growth/goals/utils/filter';
import { sortGoals } from '@/features/growth/goals/utils/sort';
import type { Goal } from '@/features/growth/goals/types';
import { subscribeToGoals } from '@/firebase/goals';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

type UseFocusGoalOptionsResult = {
  goals: Goal[];
  isLoading: boolean;
  error: string;
  retry: () => void;
};

export function useFocusGoalOptions(enabled: boolean): UseFocusGoalOptionsResult {
  const { user } = useAuth();
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setError('');
    setIsLoading(true);
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    if (!enabled || !user?.uid) {
      setAllGoals([]);
      setIsLoading(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    const unsubscribe = subscribeToGoals(
      user.uid,
      (goals) => {
        setAllGoals(goals);
        setIsLoading(false);
        setError('');
      },
      (err) => {
        setError(getFirestoreErrorMessage(err));
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [enabled, user?.uid, retryCount]);

  const goals = useMemo(
    () => sortGoals(filterGoalsByStatus(allGoals, 'active'), 'active'),
    [allGoals],
  );

  return { goals, isLoading, error, retry };
}
