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

import type { AzkarProgress, AzkarRoutine, SetAzkarProgressInput } from '@/features/deen/azkar/types';

import { getFirebaseDb } from './index';

const USERS_COLLECTION = 'users';
const AZKAR_PROGRESS_COLLECTION = 'azkarProgress';
const AZKAR_PROGRESS_ITEMS_SUBCOLLECTION = 'items';

export function azkarProgressItemsCollectionRef(uid: string, dateKey: string) {
  return collection(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    AZKAR_PROGRESS_COLLECTION,
    dateKey,
    AZKAR_PROGRESS_ITEMS_SUBCOLLECTION,
  );
}

export function azkarProgressItemDocRef(
  uid: string,
  dateKey: string,
  azkarItemId: string,
) {
  return doc(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    AZKAR_PROGRESS_COLLECTION,
    dateKey,
    AZKAR_PROGRESS_ITEMS_SUBCOLLECTION,
    azkarItemId,
  );
}

export async function setAzkarProgressDone(
  uid: string,
  dateKey: string,
  input: SetAzkarProgressInput,
): Promise<void> {
  const ref = azkarProgressItemDocRef(uid, dateKey, input.azkarItemId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const count = input.completed ? input.targetCountSnapshot : 0;
    await setDoc(ref, {
      azkarItemId: input.azkarItemId,
      dateKey,
      sourceType: input.sourceType,
      routine: input.routine,
      titleSnapshot: input.titleSnapshot,
      phraseSnapshot: input.phraseSnapshot,
      targetCountSnapshot: input.targetCountSnapshot,
      count,
      completed: input.completed,
      completedAt: input.completed ? serverTimestamp() : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  const data = snapshot.data() as Record<string, unknown>;
  const targetCountSnapshot = Number(data.targetCountSnapshot ?? input.targetCountSnapshot);
  const count = input.completed ? targetCountSnapshot : 0;

  await updateDoc(ref, {
    count,
    completed: input.completed,
    completedAt: input.completed ? serverTimestamp() : null,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToTodayAzkarProgress(
  uid: string,
  dateKey: string,
  onData: (items: AzkarProgress[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    azkarProgressItemsCollectionRef(uid, dateKey),
    (snapshot) => {
      const items: AzkarProgress[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Record<string, unknown>;
        const routine: AzkarRoutine =
          data.routine === 'evening' ? 'evening' : 'morning';
        return {
          azkarItemId: String(data.azkarItemId ?? docSnap.id),
          dateKey: String(data.dateKey ?? dateKey),
          sourceType: data.sourceType === 'custom' ? 'custom' : 'default',
          routine,
          titleSnapshot: String(data.titleSnapshot ?? ''),
          phraseSnapshot: String(data.phraseSnapshot ?? ''),
          targetCountSnapshot: Number(data.targetCountSnapshot ?? 1),
          count: Math.max(0, Math.floor(Number(data.count ?? 0))),
          completed: Boolean(data.completed),
          completedAt: (data.completedAt as AzkarProgress['completedAt']) ?? null,
          createdAt: (data.createdAt as AzkarProgress['createdAt']) ?? null,
          updatedAt: (data.updatedAt as AzkarProgress['updatedAt']) ?? null,
        };
      });
      onData(items);
    },
    (error) => onError(error),
  );
}
