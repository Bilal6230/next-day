import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/app/providers/AuthProvider';
import { subscribeToTasks } from '@/firebase/tasks';
import type { Task, TaskListFilter } from '@/features/tasks/types';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

type UseTasksResult = {
  tasks: Task[];
  isLoading: boolean;
  error: string;
  retry: () => void;
};

export function useTasks(filter: TaskListFilter): UseTasksResult {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
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
      setTasks([]);
      setIsLoading(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    const unsubscribe = subscribeToTasks(
      user.uid,
      filter,
      (nextTasks) => {
        setTasks(nextTasks);
        setIsLoading(false);
        setError('');
      },
      (err) => {
        setError(getFirestoreErrorMessage(err));
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.uid, filter, retryCount]);

  return { tasks, isLoading, error, retry };
}
