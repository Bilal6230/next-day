import {
  getDateKeyBefore,
  getTodayDateKey,
  getYesterdayDateKey,
} from '@/features/growth/utils/dates';

export type StreakStats = {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDateKey: string | null;
};

export function sortDateKeysDesc(dateKeys: string[]): string[] {
  return [...new Set(dateKeys)].sort((a, b) => b.localeCompare(a));
}

/** Consecutive chain ending at the latest check-in date (sorted desc). */
function countChainFromLatest(sortedDesc: string[]): number {
  if (sortedDesc.length === 0) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDesc.length; i++) {
    if (getDateKeyBefore(sortedDesc[i - 1]) === sortedDesc[i]) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}

function computeCurrentStreak(sortedDesc: string[]): number {
  if (sortedDesc.length === 0) return 0;

  const latest = sortedDesc[0];
  const today = getTodayDateKey();
  const yesterday = getYesterdayDateKey();

  if (latest !== today && latest !== yesterday) {
    return 0;
  }

  return countChainFromLatest(sortedDesc);
}

function longestConsecutiveChain(sortedDesc: string[]): number {
  if (sortedDesc.length === 0) return 0;

  let best = 1;
  let run = 1;

  for (let i = 1; i < sortedDesc.length; i++) {
    if (getDateKeyBefore(sortedDesc[i - 1]) === sortedDesc[i]) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }

  return best;
}

export function computeStreakStats(dateKeys: string[]): StreakStats {
  const sorted = sortDateKeysDesc(dateKeys);

  if (sorted.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDateKey: null,
    };
  }

  return {
    currentStreak: computeCurrentStreak(sorted),
    bestStreak: longestConsecutiveChain(sorted),
    lastCompletedDateKey: sorted[0],
  };
}
