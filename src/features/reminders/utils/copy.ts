import type { ReminderDataSnapshot } from '@/features/reminders/types';

export function buildTodayFocusNotificationCopy(data: ReminderDataSnapshot): {
  title: string;
  body: string;
} {
  if (!data.focusExists) {
    return {
      title: 'Set today\'s focus',
      body: 'Choose one priority to anchor your day.',
    };
  }
  return {
    title: 'Complete today\'s focus',
    body: 'Your focus is waiting — finish it when you can.',
  };
}

export function buildHabitsNotificationCopy(data: ReminderDataSnapshot): {
  title: string;
  body: string;
} {
  const count = data.incompleteHabitsCount;
  const label = count === 1 ? 'habit' : 'habits';
  return {
    title: 'Habits check-in',
    body: `${count} ${label} still waiting today.`,
  };
}

export function buildTasksNotificationCopy(data: ReminderDataSnapshot): {
  title: string;
  body: string;
} {
  const count = data.dueTasksCount;
  const label = count === 1 ? 'task' : 'tasks';
  return {
    title: 'Tasks due',
    body: `${count} pending ${label} due today or overdue.`,
  };
}

export function buildBillsNotificationCopy(data: ReminderDataSnapshot): {
  title: string;
  body: string;
} {
  const count = data.dueBillsCount;
  const label = count === 1 ? 'bill' : 'bills';
  return {
    title: 'Bills due soon',
    body: `${count} unpaid ${label} due soon or overdue.`,
  };
}
