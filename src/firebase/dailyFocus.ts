import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
} from 'firebase/firestore';

import type { DailyFocus, SetDailyFocusInput } from '@/features/today/focus/types';
import { validateSetDailyFocusInput } from '@/features/today/focus/utils/validation';

import { getFirebaseDb } from './index';

const USERS_COLLECTION = 'users';
const DAILY_FOCUS_SUBCOLLECTION = 'dailyFocus';

export function dailyFocusCollectionRef(uid: string) {
  return collection(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    DAILY_FOCUS_SUBCOLLECTION,
  );
}

export function dailyFocusDocRef(uid: string, dateKey: string) {
  return doc(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    DAILY_FOCUS_SUBCOLLECTION,
    dateKey,
  );
}

function mapDailyFocusDoc(id: string, data: Record<string, unknown>): DailyFocus {
  const sourceType = data.sourceType as DailyFocus['sourceType'];
  return {
    id,
    dateKey: String(data.dateKey ?? id),
    sourceType:
      sourceType === 'task' || sourceType === 'goal' ? sourceType : 'custom',
    sourceId: data.sourceId == null ? null : String(data.sourceId),
    title: String(data.title ?? ''),
    note: data.note == null ? null : String(data.note),
    completed: Boolean(data.completed),
    completedAt: (data.completedAt as DailyFocus['completedAt']) ?? null,
    createdAt: (data.createdAt as DailyFocus['createdAt']) ?? null,
    updatedAt: (data.updatedAt as DailyFocus['updatedAt']) ?? null,
  };
}

function sanitizeInput(input: SetDailyFocusInput): SetDailyFocusInput {
  const note =
    input.sourceType === 'custom'
      ? input.note?.trim()
        ? input.note.trim()
        : null
      : null;

  return {
    sourceType: input.sourceType,
    sourceId:
      input.sourceType === 'custom'
        ? null
        : input.sourceId?.trim()
          ? input.sourceId.trim()
          : null,
    title: input.title.trim(),
    note,
  };
}

export async function getDailyFocus(
  uid: string,
  dateKey: string,
): Promise<DailyFocus | null> {
  const snapshot = await getDoc(dailyFocusDocRef(uid, dateKey));
  if (!snapshot.exists()) return null;
  return mapDailyFocusDoc(
    snapshot.id,
    snapshot.data() as Record<string, unknown>,
  );
}

export async function setDailyFocus(
  uid: string,
  dateKey: string,
  input: SetDailyFocusInput,
): Promise<void> {
  const sanitized = sanitizeInput(input);
  const errors = validateSetDailyFocusInput(sanitized);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid focus');
  }

  const ref = dailyFocusDocRef(uid, dateKey);
  const existing = await getDoc(ref);

  const fields = {
    dateKey,
    sourceType: sanitized.sourceType,
    sourceId: sanitized.sourceId,
    title: sanitized.title,
    note: sanitized.note,
    completed: false,
    completedAt: null,
    updatedAt: serverTimestamp(),
  };

  if (existing.exists()) {
    const prev = existing.data() as Record<string, unknown>;
    await setDoc(ref, {
      ...fields,
      createdAt: prev.createdAt ?? serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      ...fields,
      createdAt: serverTimestamp(),
    });
  }
}

export async function markDailyFocusComplete(
  uid: string,
  dateKey: string,
): Promise<void> {
  const ref = dailyFocusDocRef(uid, dateKey);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    throw new Error('No focus set for today');
  }

  const data = snapshot.data() as Record<string, unknown>;
  if (Boolean(data.completed)) {
    return;
  }

  await updateDoc(ref, {
    completed: true,
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function markDailyFocusIncomplete(
  uid: string,
  dateKey: string,
): Promise<void> {
  const ref = dailyFocusDocRef(uid, dateKey);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    return;
  }

  await updateDoc(ref, {
    completed: false,
    completedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function clearDailyFocus(
  uid: string,
  dateKey: string,
): Promise<void> {
  const ref = dailyFocusDocRef(uid, dateKey);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) {
    return;
  }
  await deleteDoc(ref);
}

export function subscribeToDailyFocus(
  uid: string,
  dateKey: string,
  onData: (focus: DailyFocus | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    dailyFocusDocRef(uid, dateKey),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      onData(
        mapDailyFocusDoc(snapshot.id, snapshot.data() as Record<string, unknown>),
      );
    },
    (error) => onError(error),
  );
}
