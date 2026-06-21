import { useMemo } from 'react';

import { useCustomAzkarItems } from '@/features/deen/azkar/hooks/useCustomAzkarItems';
import { useTodayAzkarProgress } from '@/features/deen/azkar/hooks/useTodayAzkarProgress';
import {
  buildAzkarDashboardRows,
  getAzkarRoutineSummary,
} from '@/features/deen/azkar/utils/merge';

export function useAzkarDashboard(uid: string | undefined) {
  const {
    items: customItems,
    isLoading: customLoading,
    error: customError,
    retry: retryCustom,
  } = useCustomAzkarItems(uid);

  const {
    progressItems,
    dateKey,
    isLoading: progressLoading,
    error: progressError,
    retry: retryProgress,
  } = useTodayAzkarProgress(uid);

  const { morningRows, eveningRows } = useMemo(
    () => buildAzkarDashboardRows(customItems, progressItems),
    [customItems, progressItems],
  );

  const morningSummary = useMemo(
    () => getAzkarRoutineSummary(morningRows),
    [morningRows],
  );

  const eveningSummary = useMemo(
    () => getAzkarRoutineSummary(eveningRows),
    [eveningRows],
  );

  const isLoading = customLoading || progressLoading;
  const error = customError || progressError;

  const retry = () => {
    if (customError) retryCustom();
    if (progressError) retryProgress();
  };

  return {
    morningRows,
    eveningRows,
    morningSummary,
    eveningSummary,
    dateKey,
    isLoading,
    error,
    retry,
  };
}
