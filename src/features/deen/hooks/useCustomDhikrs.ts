import { useCallback, useEffect, useMemo, useState } from 'react';

import type { CustomDhikr } from '@/features/deen/types';
import { subscribeToCustomDhikrs } from '@/firebase/dhikrs';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

export function useCustomDhikrs(uid: string | undefined) {
  const [dhikrs, setDhikrs] = useState<CustomDhikr[]>([]);
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
      setDhikrs([]);
      setIsLoading(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    const unsubscribe = subscribeToCustomDhikrs(
      uid,
      (nextDhikrs) => {
        setDhikrs(nextDhikrs);
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

  return { dhikrs, isLoading, error, retry };
}
