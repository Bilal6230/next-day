import type { ReminderCategory } from '@/features/reminders/types';

export const REMINDER_CHANNEL_ID = 'next-day-reminders';

export const DEFAULT_REMINDER_TIMES: Record<ReminderCategory, string> = {
  todayFocus: '08:00',
  habits: '08:30',
  tasks: '09:00',
  bills: '19:00',
};

export const REMINDER_CATEGORY_LABELS: Record<ReminderCategory, string> = {
  todayFocus: 'Today Focus',
  habits: 'Habits',
  tasks: 'Tasks Due',
  bills: 'Bills Due',
};

export const REMINDER_CATEGORY_DESCRIPTIONS: Record<ReminderCategory, string> = {
  todayFocus: 'Daily nudge to set or complete your focus.',
  habits: 'Daily nudge when habits are still waiting.',
  tasks: 'Daily nudge when tasks are due or overdue.',
  bills: 'Daily nudge when bills are due soon.',
};
