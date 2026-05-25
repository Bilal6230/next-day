import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/app/providers/AuthProvider';
import { subscribeToBills } from '@/firebase/bills';
import type { Bill } from '@/features/money/types';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

type UseBillsResult = {
  bills: Bill[];
  isLoading: boolean;
  error: string;
  retry: () => void;
};

export function useBills(): UseBillsResult {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
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
      setBills([]);
      setIsLoading(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    const unsubscribe = subscribeToBills(
      user.uid,
      (nextBills) => {
        setBills(nextBills);
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

  return { bills, isLoading, error, retry };
}
