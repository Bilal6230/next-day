import { getWeekRangeMondayStart, isDateKeyInRange } from '@/features/growth/utils/dates';

export function countWeeklyCompletions(
  checkinsByHabit: Record<string, Set<string>>,
): number {
  const { startKey, endKey } = getWeekRangeMondayStart();
  let total = 0;

  for (const keys of Object.values(checkinsByHabit)) {
    for (const dateKey of keys) {
      if (isDateKeyInRange(dateKey, startKey, endKey)) {
        total += 1;
      }
    }
  }

  return total;
}
