import type {
  ReminderDataSnapshot,
  ReminderSettings,
} from '@/features/reminders/types';
import {
  buildBillsNotificationCopy,
  buildHabitsNotificationCopy,
  buildTasksNotificationCopy,
  buildTodayFocusNotificationCopy,
} from '@/features/reminders/utils/copy';
import { getReminderIdentifier } from '@/features/reminders/utils/identifiers';
import { parseHHmm } from '@/features/reminders/utils/time';
import {
  cancelAllReminderCategories,
  cancelReminder,
  scheduleDailyNotification,
} from '@/features/reminders/services/notifications';
import { isPermissionGranted } from '@/features/reminders/services/permissions';
import type { ReminderPermissionState } from '@/features/reminders/services/permissions';

function shouldScheduleTodayFocus(
  settings: ReminderSettings,
  data: ReminderDataSnapshot,
): boolean {
  return (
    settings.todayFocusEnabled &&
    Boolean(settings.todayFocusTime) &&
    (!data.focusExists || !data.focusCompleted)
  );
}

function shouldScheduleHabits(
  settings: ReminderSettings,
  data: ReminderDataSnapshot,
): boolean {
  return (
    settings.habitsEnabled &&
    Boolean(settings.habitsTime) &&
    data.activeHabitsCount > 0 &&
    data.incompleteHabitsCount > 0
  );
}

function shouldScheduleTasks(
  settings: ReminderSettings,
  data: ReminderDataSnapshot,
): boolean {
  return (
    settings.tasksEnabled &&
    Boolean(settings.tasksTime) &&
    data.dueTasksCount > 0
  );
}

function shouldScheduleBills(
  settings: ReminderSettings,
  data: ReminderDataSnapshot,
): boolean {
  return (
    settings.billsEnabled &&
    Boolean(settings.billsTime) &&
    data.dueBillsCount > 0
  );
}

async function syncCategory(
  uid: string,
  category: 'todayFocus' | 'habits' | 'tasks' | 'bills',
  time: string | null,
  shouldSchedule: boolean,
  title: string,
  body: string,
): Promise<void> {
  const identifier = getReminderIdentifier(category, uid);
  await cancelReminder(identifier);

  if (!shouldSchedule || !time) return;

  const parsed = parseHHmm(time);
  if (!parsed) return;

  await scheduleDailyNotification(
    identifier,
    parsed.hour,
    parsed.minute,
    title,
    body,
  );
}

export async function syncReminders(
  uid: string,
  settings: ReminderSettings,
  data: ReminderDataSnapshot,
  permission: ReminderPermissionState,
): Promise<void> {
  if (!settings.enabled || !isPermissionGranted(permission)) {
    await cancelAllReminderCategories(uid);
    return;
  }

  const focusCopy = buildTodayFocusNotificationCopy(data);
  await syncCategory(
    uid,
    'todayFocus',
    settings.todayFocusTime,
    shouldScheduleTodayFocus(settings, data),
    focusCopy.title,
    focusCopy.body,
  );

  const habitsCopy = buildHabitsNotificationCopy(data);
  await syncCategory(
    uid,
    'habits',
    settings.habitsTime,
    shouldScheduleHabits(settings, data),
    habitsCopy.title,
    habitsCopy.body,
  );

  const tasksCopy = buildTasksNotificationCopy(data);
  await syncCategory(
    uid,
    'tasks',
    settings.tasksTime,
    shouldScheduleTasks(settings, data),
    tasksCopy.title,
    tasksCopy.body,
  );

  const billsCopy = buildBillsNotificationCopy(data);
  await syncCategory(
    uid,
    'bills',
    settings.billsTime,
    shouldScheduleBills(settings, data),
    billsCopy.title,
    billsCopy.body,
  );
}
