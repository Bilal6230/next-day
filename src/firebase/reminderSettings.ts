import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Unsubscribe,
} from 'firebase/firestore';

import type {
  ReminderSettings,
  SaveReminderSettingsInput,
} from '@/features/reminders/types';

import { getFirebaseDb } from './index';

const USERS_COLLECTION = 'users';
const SETTINGS_COLLECTION = 'settings';
const REMINDERS_DOC_ID = 'reminders';

export function reminderSettingsDocRef(uid: string) {
  return doc(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    SETTINGS_COLLECTION,
    REMINDERS_DOC_ID,
  );
}

function mapReminderSettingsDoc(
  data: Record<string, unknown>,
): ReminderSettings {
  return {
    enabled: Boolean(data.enabled),
    todayFocusEnabled: Boolean(data.todayFocusEnabled),
    todayFocusTime:
      data.todayFocusTime == null ? null : String(data.todayFocusTime),
    habitsEnabled: Boolean(data.habitsEnabled),
    habitsTime: data.habitsTime == null ? null : String(data.habitsTime),
    tasksEnabled: Boolean(data.tasksEnabled),
    tasksTime: data.tasksTime == null ? null : String(data.tasksTime),
    billsEnabled: Boolean(data.billsEnabled),
    billsTime: data.billsTime == null ? null : String(data.billsTime),
    createdAt: (data.createdAt as ReminderSettings['createdAt']) ?? null,
    updatedAt: (data.updatedAt as ReminderSettings['updatedAt']) ?? null,
  };
}

export function createDefaultReminderSettings(): ReminderSettings {
  return {
    enabled: false,
    todayFocusEnabled: false,
    todayFocusTime: null,
    habitsEnabled: false,
    habitsTime: null,
    tasksEnabled: false,
    tasksTime: null,
    billsEnabled: false,
    billsTime: null,
    createdAt: null,
    updatedAt: null,
  };
}

export async function getReminderSettings(
  uid: string,
): Promise<ReminderSettings | null> {
  const snapshot = await getDoc(reminderSettingsDocRef(uid));
  if (!snapshot.exists()) return null;
  return mapReminderSettingsDoc(snapshot.data() as Record<string, unknown>);
}

export async function saveReminderSettings(
  uid: string,
  input: SaveReminderSettingsInput,
  isNew: boolean,
): Promise<void> {
  const payload: Record<string, unknown> = {
    enabled: input.enabled,
    todayFocusEnabled: input.todayFocusEnabled,
    todayFocusTime: input.todayFocusTime,
    habitsEnabled: input.habitsEnabled,
    habitsTime: input.habitsTime,
    tasksEnabled: input.tasksEnabled,
    tasksTime: input.tasksTime,
    billsEnabled: input.billsEnabled,
    billsTime: input.billsTime,
    updatedAt: serverTimestamp(),
  };

  if (isNew) {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(reminderSettingsDocRef(uid), payload, { merge: true });
}

export function subscribeToReminderSettings(
  uid: string,
  onData: (settings: ReminderSettings | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    reminderSettingsDocRef(uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      onData(mapReminderSettingsDoc(snapshot.data() as Record<string, unknown>));
    },
    (error) => onError(error),
  );
}
