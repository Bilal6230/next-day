import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/app/providers/AuthProvider';
import { subscribeToGoals } from '@/firebase/goals';
import type { Goal, GoalListFilter } from '@/features/growth/goals/types';
import { filterGoalsByStatus } from '@/features/growth/goals/utils/filter';
import { sortGoals } from '@/features/growth/goals/utils/sort';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

type UseGoalsResult = {
  goals: Goal[];
  isLoading: boolean;
  error: string;
  retry: () => void;
};

export function useGoals(statusFilter: GoalListFilter): UseGoalsResult {
  const { user } = useAuth();
  const [allGoals, setAllGoals] = useState<Goal[]>([]);
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
      setAllGoals([]);
      setIsLoading(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    const unsubscribe = subscribeToGoals(
      user.uid,
      (nextGoals) => {
        setAllGoals(nextGoals);
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

  const goals = useMemo(
    () => sortGoals(filterGoalsByStatus(allGoals, statusFilter), statusFilter),
    [allGoals, statusFilter],
  );

  return { goals, isLoading, error, retry };
}
