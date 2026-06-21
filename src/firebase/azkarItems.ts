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

import { DEFAULT_AZKAR_CATEGORY } from '@/features/deen/azkar/constants';
import type {
  AzkarRoutine,
  CreateAzkarItemInput,
  CustomAzkarItem,
  UpdateAzkarItemInput,
} from '@/features/deen/azkar/types';
import {
  isValidAzkarRoutine,
  validateCreateAzkarItemInput,
  validateUpdateAzkarItemInput,
} from '@/features/deen/azkar/utils/validation';
import { timestampMillis } from '@/shared/utils/timestamps';

import { getFirebaseDb } from './index';

const USERS_COLLECTION = 'users';
const AZKAR_ITEMS_SUBCOLLECTION = 'azkarItems';

export function azkarItemsCollectionRef(uid: string) {
  return collection(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    AZKAR_ITEMS_SUBCOLLECTION,
  );
}

export function azkarItemDocRef(uid: string, azkarItemId: string) {
  return doc(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    AZKAR_ITEMS_SUBCOLLECTION,
    azkarItemId,
  );
}

function mapAzkarItemDoc(
  id: string,
  data: Record<string, unknown>,
): CustomAzkarItem {
  const routine: AzkarRoutine =
    data.routine === 'evening' ? 'evening' : 'morning';

  return {
    id,
    title: String(data.title ?? ''),
    phrase: String(data.phrase ?? ''),
    transliteration:
      data.transliteration == null ? null : String(data.transliteration),
    translation: data.translation == null ? null : String(data.translation),
    routine,
    targetCount: Number(data.targetCount ?? 1),
    category: String(data.category ?? DEFAULT_AZKAR_CATEGORY),
    status: data.status === 'archived' ? 'archived' : 'active',
    archivedAt: (data.archivedAt as CustomAzkarItem['archivedAt']) ?? null,
    createdAt: (data.createdAt as CustomAzkarItem['createdAt']) ?? null,
    updatedAt: (data.updatedAt as CustomAzkarItem['updatedAt']) ?? null,
  };
}

function sanitizeCreateInput(input: CreateAzkarItemInput): CreateAzkarItemInput {
  return {
    title: input.title.trim(),
    phrase: input.phrase.trim(),
    transliteration: input.transliteration?.trim() || null,
    translation: input.translation?.trim() || null,
    routine: input.routine,
    targetCount: input.targetCount,
    category: input.category?.trim() || DEFAULT_AZKAR_CATEGORY,
  };
}

function sanitizeUpdatePatch(
  patch: UpdateAzkarItemInput,
): UpdateAzkarItemInput {
  const sanitized: UpdateAzkarItemInput = { ...patch };
  if (patch.title !== undefined) sanitized.title = patch.title.trim();
  if (patch.phrase !== undefined) sanitized.phrase = patch.phrase.trim();
  if (patch.transliteration !== undefined) {
    sanitized.transliteration = patch.transliteration?.trim() || null;
  }
  if (patch.translation !== undefined) {
    sanitized.translation = patch.translation?.trim() || null;
  }
  if (patch.category !== undefined) {
    sanitized.category = patch.category.trim() || DEFAULT_AZKAR_CATEGORY;
  }
  return sanitized;
}

export async function getAzkarItem(
  uid: string,
  azkarItemId: string,
): Promise<CustomAzkarItem | null> {
  const snapshot = await getDoc(azkarItemDocRef(uid, azkarItemId));
  if (!snapshot.exists()) return null;
  return mapAzkarItemDoc(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function createAzkarItem(
  uid: string,
  input: CreateAzkarItemInput,
): Promise<string> {
  if (!isValidAzkarRoutine(input.routine)) {
    throw new Error('Invalid azkar routine');
  }

  const errors = validateCreateAzkarItemInput(input);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid azkar');
  }

  const sanitized = sanitizeCreateInput(input);
  const ref = doc(azkarItemsCollectionRef(uid));

  await setDoc(ref, {
    title: sanitized.title,
    phrase: sanitized.phrase,
    transliteration: sanitized.transliteration,
    translation: sanitized.translation,
    routine: sanitized.routine,
    targetCount: sanitized.targetCount,
    category: sanitized.category,
    status: 'active',
    archivedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateAzkarItem(
  uid: string,
  azkarItemId: string,
  patch: UpdateAzkarItemInput,
): Promise<void> {
  if ('routine' in patch) {
    throw new Error('Invalid azkar');
  }

  const errors = validateUpdateAzkarItemInput(patch);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid azkar');
  }

  const existing = await getAzkarItem(uid, azkarItemId);
  if (!existing) {
    throw new Error('Azkar not found');
  }
  if (existing.status === 'archived') {
    throw new Error('Cannot update an archived azkar');
  }

  const sanitized = sanitizeUpdatePatch(patch);
  const updates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (sanitized.title !== undefined) updates.title = sanitized.title;
  if (sanitized.phrase !== undefined) updates.phrase = sanitized.phrase;
  if (sanitized.transliteration !== undefined) {
    updates.transliteration = sanitized.transliteration;
  }
  if (sanitized.translation !== undefined) {
    updates.translation = sanitized.translation;
  }
  if (sanitized.targetCount !== undefined) {
    updates.targetCount = sanitized.targetCount;
  }
  if (sanitized.category !== undefined) updates.category = sanitized.category;

  await updateDoc(azkarItemDocRef(uid, azkarItemId), updates);
}

export async function archiveAzkarItem(
  uid: string,
  azkarItemId: string,
): Promise<void> {
  const existing = await getAzkarItem(uid, azkarItemId);
  if (!existing) {
    throw new Error('Azkar not found');
  }
  if (existing.status === 'archived') {
    return;
  }

  await updateDoc(azkarItemDocRef(uid, azkarItemId), {
    status: 'archived',
    archivedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToCustomAzkarItems(
  uid: string,
  onData: (items: CustomAzkarItem[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    azkarItemsCollectionRef(uid),
    (snapshot) => {
      const items = snapshot.docs
        .map((docSnap) =>
          mapAzkarItemDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
        )
        .sort(
          (a, b) => timestampMillis(b.createdAt) - timestampMillis(a.createdAt),
        );
      onData(items);
    },
    (error) => onError(error),
  );
}
