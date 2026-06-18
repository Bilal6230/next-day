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

import { DEFAULT_DHIKR_CATEGORY } from '@/features/deen/constants';
import type {
  CreateDhikrInput,
  CustomDhikr,
  UpdateDhikrInput,
} from '@/features/deen/types';
import {
  validateCreateDhikrInput,
  validateUpdateDhikrInput,
} from '@/features/deen/utils/validation';
import { timestampMillis } from '@/shared/utils/timestamps';

import { getFirebaseDb } from './index';

const USERS_COLLECTION = 'users';
const DHIKRS_SUBCOLLECTION = 'dhikrs';

export function dhikrsCollectionRef(uid: string) {
  return collection(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    DHIKRS_SUBCOLLECTION,
  );
}

export function dhikrDocRef(uid: string, dhikrId: string) {
  return doc(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    DHIKRS_SUBCOLLECTION,
    dhikrId,
  );
}

function mapDhikrDoc(id: string, data: Record<string, unknown>): CustomDhikr {
  return {
    id,
    title: String(data.title ?? ''),
    phrase: String(data.phrase ?? ''),
    transliteration:
      data.transliteration == null ? null : String(data.transliteration),
    translation: data.translation == null ? null : String(data.translation),
    targetCount: Number(data.targetCount ?? 1),
    category: String(data.category ?? DEFAULT_DHIKR_CATEGORY),
    status: data.status === 'archived' ? 'archived' : 'active',
    archivedAt: (data.archivedAt as CustomDhikr['archivedAt']) ?? null,
    createdAt: (data.createdAt as CustomDhikr['createdAt']) ?? null,
    updatedAt: (data.updatedAt as CustomDhikr['updatedAt']) ?? null,
  };
}

function sanitizeCreateInput(input: CreateDhikrInput): CreateDhikrInput {
  return {
    title: input.title.trim(),
    phrase: input.phrase.trim(),
    transliteration: input.transliteration?.trim() || null,
    translation: input.translation?.trim() || null,
    targetCount: input.targetCount,
    category: input.category?.trim() || DEFAULT_DHIKR_CATEGORY,
  };
}

function sanitizeUpdatePatch(patch: UpdateDhikrInput): UpdateDhikrInput {
  const sanitized: UpdateDhikrInput = { ...patch };
  if (patch.title !== undefined) sanitized.title = patch.title.trim();
  if (patch.phrase !== undefined) sanitized.phrase = patch.phrase.trim();
  if (patch.transliteration !== undefined) {
    sanitized.transliteration = patch.transliteration?.trim() || null;
  }
  if (patch.translation !== undefined) {
    sanitized.translation = patch.translation?.trim() || null;
  }
  if (patch.category !== undefined) {
    sanitized.category = patch.category.trim() || DEFAULT_DHIKR_CATEGORY;
  }
  return sanitized;
}

export async function getDhikr(
  uid: string,
  dhikrId: string,
): Promise<CustomDhikr | null> {
  const snapshot = await getDoc(dhikrDocRef(uid, dhikrId));
  if (!snapshot.exists()) return null;
  return mapDhikrDoc(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function createDhikr(
  uid: string,
  input: CreateDhikrInput,
): Promise<string> {
  const errors = validateCreateDhikrInput(input);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid dhikr');
  }

  const sanitized = sanitizeCreateInput(input);
  const ref = doc(dhikrsCollectionRef(uid));

  await setDoc(ref, {
    title: sanitized.title,
    phrase: sanitized.phrase,
    transliteration: sanitized.transliteration,
    translation: sanitized.translation,
    targetCount: sanitized.targetCount,
    category: sanitized.category,
    status: 'active',
    archivedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateDhikr(
  uid: string,
  dhikrId: string,
  patch: UpdateDhikrInput,
): Promise<void> {
  const errors = validateUpdateDhikrInput(patch);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid dhikr');
  }

  const existing = await getDhikr(uid, dhikrId);
  if (!existing) {
    throw new Error('Dhikr not found');
  }
  if (existing.status === 'archived') {
    throw new Error('Cannot update an archived dhikr');
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

  await updateDoc(dhikrDocRef(uid, dhikrId), updates);
}

export async function archiveDhikr(uid: string, dhikrId: string): Promise<void> {
  const existing = await getDhikr(uid, dhikrId);
  if (!existing) {
    throw new Error('Dhikr not found');
  }
  if (existing.status === 'archived') {
    return;
  }

  await updateDoc(dhikrDocRef(uid, dhikrId), {
    status: 'archived',
    archivedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToCustomDhikrs(
  uid: string,
  onData: (dhikrs: CustomDhikr[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    dhikrsCollectionRef(uid),
    (snapshot) => {
      const dhikrs = snapshot.docs
        .map((docSnap) =>
          mapDhikrDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
        )
        .sort(
          (a, b) => timestampMillis(b.createdAt) - timestampMillis(a.createdAt),
        );
      onData(dhikrs);
    },
    (error) => onError(error),
  );
}
