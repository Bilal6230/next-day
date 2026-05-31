import type { Goal, GoalListFilter } from '@/features/growth/goals/types';

function timestampMillis(value: Goal['updatedAt']): number {
  return value?.toMillis?.() ?? 0;
}

function sortActiveGoals(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => {
    const aHasTarget = a.targetDateKey != null;
    const bHasTarget = b.targetDateKey != null;

    if (aHasTarget && bHasTarget) {
      const keyCompare = a.targetDateKey!.localeCompare(b.targetDateKey!);
      if (keyCompare !== 0) return keyCompare;
    } else if (aHasTarget !== bHasTarget) {
      return aHasTarget ? -1 : 1;
    }

    return timestampMillis(b.updatedAt) - timestampMillis(a.updatedAt);
  });
}

function sortByUpdatedDesc(goals: Goal[]): Goal[] {
  return [...goals].sort(
    (a, b) => timestampMillis(b.updatedAt) - timestampMillis(a.updatedAt),
  );
}

export function sortGoals(goals: Goal[], statusFilter: GoalListFilter): Goal[] {
  if (statusFilter === 'active') {
    return sortActiveGoals(goals);
  }
  return sortByUpdatedDesc(goals);
}
