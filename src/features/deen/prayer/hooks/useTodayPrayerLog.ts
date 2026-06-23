import { useCallback, useEffect, useMemo, useState } from 'react';

import type { PrayerLog } from '@/features/deen/prayer/types';
import { computePrayerSummary } from '@/features/deen/prayer/utils/summary';
import { getTodayDateKey } from '@/features/growth/utils/dates';
import {
  createDefaultPrayerLog,
  subscribeToPrayerLog,
} from '@/firebase/prayerLogs';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

export function useTodayPrayerLog(uid: string | undefined) {
  const [rawLog, setRawLog] = useState<PrayerLog | null>(null);
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
      setRawLog(null);
      setIsLoading(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    const unsubscribe = subscribeToPrayerLog(
      uid,
      dateKey,
      (nextLog) => {
        setRawLog(nextLog);
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

  const log = useMemo(
    () => rawLog ?? createDefaultPrayerLog(dateKey),
    [rawLog, dateKey],
  );

  const summary = useMemo(
    () => computePrayerSummary(log.prayers),
    [log.prayers],
  );

  return {
    log,
    summary,
    dateKey,
    isLoading,
    error,
    retry,
  };
}
