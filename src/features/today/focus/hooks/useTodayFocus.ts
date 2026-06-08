import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/app/providers/AuthProvider';
import { getTodayDateKey } from '@/features/growth/utils/dates';
import type { DailyFocus, SetDailyFocusInput } from '@/features/today/focus/types';
import {
  clearDailyFocus,
  markDailyFocusComplete,
  markDailyFocusIncomplete,
  setDailyFocus,
  subscribeToDailyFocus,
} from '@/firebase/dailyFocus';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

type UseTodayFocusResult = {
  focus: DailyFocus | null;
  todayKey: string;
  isLoading: boolean;
  error: string;
  retry: () => void;
  setFocus: (input: SetDailyFocusInput) => Promise<void>;
  completeFocus: () => Promise<void>;
  undoCompleteFocus: () => Promise<void>;
  clearFocus: () => Promise<void>;
};

export function useTodayFocus(): UseTodayFocusResult {
  const { user } = useAuth();
  const todayKey = getTodayDateKey();
  const [focus, setFocusState] = useState<DailyFocus | null>(null);
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
      setFocusState(null);
      setIsLoading(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    const unsubscribe = subscribeToDailyFocus(
      user.uid,
      todayKey,
      (nextFocus) => {
        setFocusState(nextFocus);
        setIsLoading(false);
        setError('');
      },
      (err) => {
        setError(getFirestoreErrorMessage(err));
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.uid, todayKey, retryCount]);

  const setFocus = useCallback(
    async (input: SetDailyFocusInput) => {
      if (!user?.uid) return;
      await setDailyFocus(user.uid, todayKey, input);
    },
    [user?.uid, todayKey],
  );

  const completeFocus = useCallback(async () => {
    if (!user?.uid) return;
    await markDailyFocusComplete(user.uid, todayKey);
  }, [user?.uid, todayKey]);

  const undoCompleteFocus = useCallback(async () => {
    if (!user?.uid) return;
    await markDailyFocusIncomplete(user.uid, todayKey);
  }, [user?.uid, todayKey]);

  const clearFocus = useCallback(async () => {
    if (!user?.uid) return;
    await clearDailyFocus(user.uid, todayKey);
  }, [user?.uid, todayKey]);

  return {
    focus,
    todayKey,
    isLoading,
    error,
    retry,
    setFocus,
    completeFocus,
    undoCompleteFocus,
    clearFocus,
  };
}
