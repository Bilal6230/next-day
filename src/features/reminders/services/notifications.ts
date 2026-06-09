import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { REMINDER_CHANNEL_ID } from '@/features/reminders/constants';
import { getAllReminderIdentifiers } from '@/features/reminders/utils/identifiers';

let handlerConfigured = false;

export function ensureNotificationHandler(): void {
  if (handlerConfigured) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  handlerConfigured = true;
}

export async function scheduleDailyNotification(
  identifier: string,
  hour: number,
  minute: number,
  title: string,
  body: string,
): Promise<void> {
  ensureNotificationHandler();

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body,
      sound: true,
      ...(Platform.OS === 'android' ? { channelId: REMINDER_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      ...(Platform.OS === 'android' ? { channelId: REMINDER_CHANNEL_ID } : {}),
    },
  });
}

export async function cancelReminder(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch {
    // Notification may not exist — safe to ignore.
  }
}

export async function cancelAllReminderCategories(uid: string): Promise<void> {
  const identifiers = getAllReminderIdentifiers(uid);
  await Promise.all(identifiers.map((id) => cancelReminder(id)));
}
