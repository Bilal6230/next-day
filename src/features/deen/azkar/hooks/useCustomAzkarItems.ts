import { useCallback, useEffect, useState } from 'react';

import type { CustomAzkarItem } from '@/features/deen/azkar/types';
import { subscribeToCustomAzkarItems } from '@/firebase/azkarItems';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

export function useCustomAzkarItems(uid: string | undefined) {
  const [items, setItems] = useState<CustomAzkarItem[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(uid));
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setError('');
    setIsLoading(true);
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    if (!uid) {
      setItems([]);
      setIsLoading(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    const unsubscribe = subscribeToCustomAzkarItems(
      uid,
      (nextItems) => {
        setItems(nextItems);
        setIsLoading(false);
        setError('');
      },
      (err) => {
        setError(getFirestoreErrorMessage(err));
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [uid, retryCount]);

  return { items, isLoading, error, retry };
}
