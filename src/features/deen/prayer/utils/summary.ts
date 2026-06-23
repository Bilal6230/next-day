import {
  COMPLETED_PRAYER_STATUSES,
  PRAYER_KEYS,
  PRAYER_TOTAL_COUNT,
} from '@/features/deen/prayer/constants';
import type { PrayerStatuses, PrayerSummary } from '@/features/deen/prayer/types';

export function computePrayerSummary(
  prayers: PrayerStatuses,
): PrayerSummary {
  let completedCount = 0;
  let pendingCount = 0;
  let missedCount = 0;

  for (const key of PRAYER_KEYS) {
    const status = prayers[key];
    if (status === 'missed') {
      missedCount += 1;
    } else if (status === 'pending') {
      pendingCount += 1;
    } else if (COMPLETED_PRAYER_STATUSES.includes(status)) {
      completedCount += 1;
    }
  }

  return {
    completedCount,
    pendingCount,
    missedCount,
    totalCount: PRAYER_TOTAL_COUNT,
  };
}
