import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/app/providers/AuthProvider';
import type { Task } from '@/features/tasks/types';
import { subscribeToTasks } from '@/firebase/tasks';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

type UseFocusTaskOptionsResult = {
  tasks: Task[];
  isLoading: boolean;
  error: string;
  retry: () => void;
};

function sortPendingTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aMs = a.updatedAt?.toMillis?.() ?? 0;
    const bMs = b.updatedAt?.toMillis?.() ?? 0;
    return bMs - aMs;
  });
}

export function useFocusTaskOptions(enabled: boolean): UseFocusTaskOptionsResult {
  const { user } = useAuth();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
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
      setAllTasks([]);
      setIsLoading(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    const unsubscribe = subscribeToTasks(
      user.uid,
      'all',
      (tasks) => {
        setAllTasks(tasks);
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

  const tasks = useMemo(
    () => sortPendingTasks(allTasks.filter((task) => task.status === 'pending')),
    [allTasks],
  );

  return { tasks, isLoading, error, retry };
}
