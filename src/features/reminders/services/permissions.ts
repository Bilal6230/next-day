import * as Notifications from 'expo-notifications';

import { ensureReminderChannel } from '@/features/reminders/services/channels';

export type ReminderPermissionState = 'granted' | 'denied' | 'undetermined';

export async function getReminderPermissionState(): Promise<ReminderPermissionState> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export async function requestReminderPermission(): Promise<ReminderPermissionState> {
  await ensureReminderChannel();

  const existing = await getReminderPermissionState();
  if (existing === 'granted') return 'granted';

  const { status } = await Notifications.requestPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

export function isPermissionGranted(state: ReminderPermissionState): boolean {
  return state === 'granted';
}
