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

import type {
  CreateNoteInput,
  Note,
  UpdateNoteInput,
} from '@/features/notes/types';
import { normalizeTags } from '@/features/notes/utils/tags';
import {
  validateCreateNoteInput,
  validateUpdateNoteInput,
} from '@/features/notes/utils/validation';

import { getFirebaseDb } from './index';

const USERS_COLLECTION = 'users';
const NOTES_SUBCOLLECTION = 'notes';

export function notesCollectionRef(uid: string) {
  return collection(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    NOTES_SUBCOLLECTION,
  );
}

export function noteDocRef(uid: string, noteId: string) {
  return doc(getFirebaseDb(), USERS_COLLECTION, uid, NOTES_SUBCOLLECTION, noteId);
}

function mapNoteDoc(id: string, data: Record<string, unknown>): Note {
  const rawTags = data.tags;
  const tags = Array.isArray(rawTags)
    ? normalizeTags(rawTags.map((tag) => String(tag)))
    : [];

  return {
    id,
    title: String(data.title ?? ''),
    body: String(data.body ?? ''),
    tags,
    pinned: Boolean(data.pinned),
    status: data.status === 'archived' ? 'archived' : 'active',
    createdAt: (data.createdAt as Note['createdAt']) ?? null,
    updatedAt: (data.updatedAt as Note['updatedAt']) ?? null,
  };
}

function sanitizeCreateInput(input: CreateNoteInput): CreateNoteInput {
  return {
    title: input.title.trim(),
    body: input.body?.trim() ?? '',
    tags: normalizeTags(input.tags ?? []),
    pinned: Boolean(input.pinned),
  };
}

function sanitizeUpdatePatch(patch: UpdateNoteInput): UpdateNoteInput {
  const sanitized: UpdateNoteInput = { ...patch };
  if (patch.title !== undefined) sanitized.title = patch.title.trim();
  if (patch.body !== undefined) sanitized.body = patch.body.trim();
  if (patch.tags !== undefined) sanitized.tags = normalizeTags(patch.tags);
  return sanitized;
}

export async function getNote(
  uid: string,
  noteId: string,
): Promise<Note | null> {
  const snapshot = await getDoc(noteDocRef(uid, noteId));
  if (!snapshot.exists()) return null;
  return mapNoteDoc(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function createNote(
  uid: string,
  input: CreateNoteInput,
): Promise<string> {
  const sanitized = sanitizeCreateInput(input);
  const errors = validateCreateNoteInput(sanitized);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid note');
  }

  const ref = doc(notesCollectionRef(uid));
  await setDoc(ref, {
    title: sanitized.title,
    body: sanitized.body ?? '',
    tags: sanitized.tags ?? [],
    pinned: sanitized.pinned ?? false,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateNote(
  uid: string,
  noteId: string,
  patch: UpdateNoteInput,
): Promise<void> {
  const sanitized = sanitizeUpdatePatch(patch);
  const errors = validateUpdateNoteInput(sanitized);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid note');
  }

  const updates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (sanitized.title !== undefined) updates.title = sanitized.title;
  if (sanitized.body !== undefined) updates.body = sanitized.body;
  if (sanitized.tags !== undefined) updates.tags = sanitized.tags;
  if (sanitized.pinned !== undefined) updates.pinned = sanitized.pinned;
  if (sanitized.status !== undefined) updates.status = sanitized.status;

  await updateDoc(noteDocRef(uid, noteId), updates);
}

export async function archiveNote(uid: string, noteId: string): Promise<void> {
  await updateDoc(noteDocRef(uid, noteId), {
    status: 'archived',
    pinned: false,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(uid: string, noteId: string): Promise<void> {
  await deleteDoc(noteDocRef(uid, noteId));
}

export async function setNotePinned(
  uid: string,
  noteId: string,
  pinned: boolean,
): Promise<void> {
  await updateDoc(noteDocRef(uid, noteId), {
    pinned,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToNotes(
  uid: string,
  onData: (notes: Note[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    notesCollectionRef(uid),
    (snapshot) => {
      const notes = snapshot.docs.map((docSnap) =>
        mapNoteDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
      );
      onData(notes);
    },
    (error) => onError(error),
  );
}
