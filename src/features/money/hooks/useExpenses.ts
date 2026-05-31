import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/app/providers/AuthProvider';
import { subscribeToExpenses } from '@/firebase/expenses';
import type { Expense } from '@/features/money/types';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

type UseExpensesResult = {
  expenses: Expense[];
  isLoading: boolean;
  error: string;
  retry: () => void;
};

export function useExpenses(): UseExpensesResult {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
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
      setExpenses([]);
      setIsLoading(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    const unsubscribe = subscribeToExpenses(
      user.uid,
      (nextExpenses) => {
        setExpenses(nextExpenses);
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

  return { expenses, isLoading, error, retry };
}
