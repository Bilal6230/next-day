import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { REMINDER_CHANNEL_ID } from '@/features/reminders/constants';

let channelReady = false;

export async function ensureReminderChannel(): Promise<void> {
  if (Platform.OS !== 'android' || channelReady) return;

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#7C3AED',
  });

  channelReady = true;
}
