import { useMemo } from 'react';

import { PREDEFINED_DHIKR_CATEGORY } from '@/features/deen/constants';
import { useCustomDhikrs } from '@/features/deen/hooks/useCustomDhikrs';
import { useTodayDhikrProgress } from '@/features/deen/hooks/useTodayDhikrProgress';
import type { DhikrDashboardRow } from '@/features/deen/types';
import {
  buildDhikrDashboardRows,
  getDhikrDashboardSummary,
} from '@/features/deen/utils/merge';

export function useDhikrDashboard(uid: string | undefined) {
  const {
    dhikrs: customDhikrs,
    isLoading: customLoading,
    error: customError,
    retry: retryCustom,
  } = useCustomDhikrs(uid);

  const {
    progressItems,
    isLoading: progressLoading,
    error: progressError,
    retry: retryProgress,
  } = useTodayDhikrProgress(uid);

  const rows = useMemo(
    () => buildDhikrDashboardRows(customDhikrs, progressItems),
    [customDhikrs, progressItems],
  );

  const commonRows = useMemo(
    () => rows.filter((row) => row.category === PREDEFINED_DHIKR_CATEGORY),
    [rows],
  );

  const customRows = useMemo(
    () => rows.filter((row) => row.sourceType === 'custom'),
    [rows],
  );

  const summary = useMemo(() => getDhikrDashboardSummary(rows), [rows]);

  const isLoading = customLoading || progressLoading;
  const error = customError || progressError;

  const retry = () => {
    if (customError) retryCustom();
    if (progressError) retryProgress();
  };

  return {
    rows,
    commonRows,
    customRows,
    summary,
    isLoading,
    error,
    retry,
  };
}
