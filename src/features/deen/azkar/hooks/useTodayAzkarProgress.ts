import { useCallback, useEffect, useState } from 'react';

import type { AzkarProgress } from '@/features/deen/azkar/types';
import { getTodayDateKey } from '@/features/growth/utils/dates';
import { subscribeToTodayAzkarProgress } from '@/firebase/azkarProgress';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

export function useTodayAzkarProgress(uid: string | undefined) {
  const [progressItems, setProgressItems] = useState<AzkarProgress[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(uid));
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const dateKey = getTodayDateKey();

  const retry = useCallback(() => {
    setError('');
    setIsLoading(true);
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    if (!uid) {
      setProgressItems([]);
      setIsLoading(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    const unsubscribe = subscribeToTodayAzkarProgress(
      uid,
      dateKey,
      (items) => {
        setProgressItems(items);
        setIsLoading(false);
        setError('');
      },
      (err) => {
        setError(getFirestoreErrorMessage(err));
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [uid, dateKey, retryCount]);

  return { progressItems, dateKey, isLoading, error, retry };
}
