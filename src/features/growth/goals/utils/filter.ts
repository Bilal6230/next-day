import type { Goal, GoalListFilter } from '@/features/growth/goals/types';

export function filterGoalsByStatus(
  goals: Goal[],
  statusFilter: GoalListFilter,
): Goal[] {
  return goals.filter((goal) => goal.status === statusFilter);
}
