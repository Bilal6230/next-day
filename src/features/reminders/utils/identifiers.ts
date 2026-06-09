import type { ReminderCategory } from '@/features/reminders/types';

export function getReminderIdentifier(
  category: ReminderCategory,
  uid: string,
): string {
  switch (category) {
    case 'todayFocus':
      return `today-focus-${uid}`;
    case 'habits':
      return `habits-${uid}`;
    case 'tasks':
      return `tasks-${uid}`;
    case 'bills':
      return `bills-${uid}`;
  }
}

export function getAllReminderIdentifiers(uid: string): string[] {
  return [
    getReminderIdentifier('todayFocus', uid),
    getReminderIdentifier('habits', uid),
    getReminderIdentifier('tasks', uid),
    getReminderIdentifier('bills', uid),
  ];
}
