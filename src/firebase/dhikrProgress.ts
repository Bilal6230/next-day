import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
} from 'firebase/firestore';

import type { DhikrProgress, SetDhikrProgressCountInput } from '@/features/deen/types';
import { clampDhikrCount, isDhikrCompleted } from '@/features/deen/utils/progress';

import { getFirebaseDb } from './index';

const USERS_COLLECTION = 'users';
const DHIKR_PROGRESS_COLLECTION = 'dhikrProgress';
const DHIKR_PROGRESS_ITEMS_SUBCOLLECTION = 'items';

export function dhikrProgressItemsCollectionRef(uid: string, dateKey: string) {
  return collection(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    DHIKR_PROGRESS_COLLECTION,
    dateKey,
    DHIKR_PROGRESS_ITEMS_SUBCOLLECTION,
  );
}

export function dhikrProgressItemDocRef(
  uid: string,
  dateKey: string,
  dhikrId: string,
) {
  return doc(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    DHIKR_PROGRESS_COLLECTION,
    dateKey,
    DHIKR_PROGRESS_ITEMS_SUBCOLLECTION,
    dhikrId,
  );
}

function mapDhikrProgressDoc(
  data: Record<string, unknown>,
): DhikrProgress {
  return {
    dhikrId: String(data.dhikrId ?? ''),
    dateKey: String(data.dateKey ?? ''),
    sourceType: data.sourceType === 'custom' ? 'custom' : 'default',
    titleSnapshot: String(data.titleSnapshot ?? ''),
    phraseSnapshot: String(data.phraseSnapshot ?? ''),
    targetCountSnapshot: Number(data.targetCountSnapshot ?? 1),
    count: clampDhikrCount(Number(data.count ?? 0)),
    completed: Boolean(data.completed),
    completedAt: (data.completedAt as DhikrProgress['completedAt']) ?? null,
    createdAt: (data.createdAt as DhikrProgress['createdAt']) ?? null,
    updatedAt: (data.updatedAt as DhikrProgress['updatedAt']) ?? null,
  };
}

export async function setDhikrProgressCount(
  uid: string,
  dateKey: string,
  input: SetDhikrProgressCountInput,
): Promise<void> {
  const count = clampDhikrCount(input.count);
  if (count < 0) {
    throw new Error('Count cannot be negative');
  }

  const ref = dhikrProgressItemDocRef(uid, dateKey, input.dhikrId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const completed = isDhikrCompleted(count, input.targetCountSnapshot);
    await setDoc(ref, {
      dhikrId: input.dhikrId,
      dateKey,
      sourceType: input.sourceType,
      titleSnapshot: input.titleSnapshot,
      phraseSnapshot: input.phraseSnapshot,
      targetCountSnapshot: input.targetCountSnapshot,
      count,
      completed,
      completedAt: completed ? serverTimestamp() : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  const existing = mapDhikrProgressDoc(
    snapshot.data() as Record<string, unknown>,
  );
  const completed = isDhikrCompleted(count, existing.targetCountSnapshot);

  await updateDoc(ref, {
    count,
    completed,
    completedAt: completed ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
}

export async function resetDhikrProgressToday(
  uid: string,
  dateKey: string,
  dhikrId: string,
): Promise<void> {
  const ref = dhikrProgressItemDocRef(uid, dateKey, dhikrId);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return;

  await updateDoc(ref, {
    count: 0,
    completed: false,
    completedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToTodayDhikrProgress(
  uid: string,
  dateKey: string,
  onData: (items: DhikrProgress[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    dhikrProgressItemsCollectionRef(uid, dateKey),
    (snapshot) => {
      const items = snapshot.docs.map((docSnap) =>
        mapDhikrProgressDoc(docSnap.data() as Record<string, unknown>),
      );
      onData(items);
    },
    (error) => onError(error),
  );
}

export function subscribeToDhikrProgressItem(
  uid: string,
  dateKey: string,
  dhikrId: string,
  onData: (item: DhikrProgress | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    dhikrProgressItemDocRef(uid, dateKey, dhikrId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onData(null);
        return;
      }
      onData(
        mapDhikrProgressDoc(snapshot.data() as Record<string, unknown>),
      );
    },
    (error) => onError(error),
  );
}
