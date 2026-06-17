import type { Bill } from '@/features/money/types';
import { filterBillsDueSoon } from '@/features/money/utils/billsDue';
import type { Habit } from '@/features/growth/types';
import { getTodayDateKey } from '@/features/growth/utils/dates';
import type { DailyFocus } from '@/features/today/focus/types';
import type { ReminderDataSnapshot } from '@/features/reminders/types';
import type { Task } from '@/features/tasks/types';
import { isDueTodayOrOverdue } from '@/features/tasks/utils/dates';

export function buildReminderDataSnapshot(input: {
  focus: DailyFocus | null;
  tasks: Task[];
  bills: Bill[];
  habits: Habit[];
}): ReminderDataSnapshot {
  const todayKey = getTodayDateKey();
  const activeHabits = input.habits.filter((habit) => habit.status === 'active');
  const incompleteHabits = activeHabits.filter(
    (habit) => habit.lastCompletedDateKey !== todayKey,
  );

  return {
    focusExists: input.focus != null,
    focusCompleted: Boolean(input.focus?.completed),
    activeHabitsCount: activeHabits.length,
    incompleteHabitsCount: incompleteHabits.length,
    dueTasksCount: input.tasks.filter(isDueTodayOrOverdue).length,
    dueBillsCount: filterBillsDueSoon(input.bills).length,
  };
}
