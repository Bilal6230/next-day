import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
} from 'firebase/firestore';

import {
  createDefaultPrayerStatuses,
} from '@/features/deen/prayer/constants';
import type {
  PrayerKey,
  PrayerLog,
  PrayerStatus,
  PrayerStatuses,
} from '@/features/deen/prayer/types';
import {
  normalizePrayerStatus,
  validatePrayerKey,
  validatePrayerStatus,
} from '@/features/deen/prayer/utils/validation';

import { getFirebaseDb } from './index';

const USERS_COLLECTION = 'users';
const PRAYER_LOGS_COLLECTION = 'prayerLogs';

export function prayerLogDocRef(uid: string, dateKey: string) {
  return doc(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    PRAYER_LOGS_COLLECTION,
    dateKey,
  );
}

function mapPrayerStatuses(raw: unknown): PrayerStatuses {
  const defaults = createDefaultPrayerStatuses();
  if (!raw || typeof raw !== 'object') {
    return defaults;
  }

  const data = raw as Record<string, unknown>;
  return {
    fajr: normalizePrayerStatus(data.fajr),
    dhuhr: normalizePrayerStatus(data.dhuhr),
    asr: normalizePrayerStatus(data.asr),
    maghrib: normalizePrayerStatus(data.maghrib),
    isha: normalizePrayerStatus(data.isha),
  };
}

function mapPrayerLogDoc(
  dateKey: string,
  data: Record<string, unknown>,
): PrayerLog {
  return {
    dateKey: String(data.dateKey ?? dateKey),
    prayers: mapPrayerStatuses(data.prayers),
    createdAt: (data.createdAt as PrayerLog['createdAt']) ?? null,
    updatedAt: (data.updatedAt as PrayerLog['updatedAt']) ?? null,
  };
}

export function createDefaultPrayerLog(dateKey: string): PrayerLog {
  return {
    dateKey,
    prayers: createDefaultPrayerStatuses(),
    createdAt: null,
    updatedAt: null,
  };
}

export async function getPrayerLog(
  uid: string,
  dateKey: string,
): Promise<PrayerLog | null> {
  const snapshot = await getDoc(prayerLogDocRef(uid, dateKey));
  if (!snapshot.exists()) return null;
  return mapPrayerLogDoc(dateKey, snapshot.data() as Record<string, unknown>);
}

export async function setPrayerStatus(
  uid: string,
  dateKey: string,
  prayerKey: PrayerKey,
  status: PrayerStatus,
): Promise<void> {
  validatePrayerKey(prayerKey);
  validatePrayerStatus(status);

  const ref = prayerLogDocRef(uid, dateKey);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const prayers = createDefaultPrayerStatuses();
    prayers[prayerKey] = status;

    await setDoc(ref, {
      dateKey,
      prayers,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  await updateDoc(ref, {
    [`prayers.${prayerKey}`]: status,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToPrayerLog(
  uid: string,
  dateKey: string,
  onData: (log: PrayerLog | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    prayerLogDocRef(uid, dateKey),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      onData(mapPrayerLogDoc(dateKey, snapshot.data() as Record<string, unknown>));
    },
    (error) => onError(error),
  );
}
