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
  const rawTags = (input.tags ?? []).map((tag) => String(tag).trim());
  return {
    title: input.title.trim(),
    body: input.body?.trim() ?? '',
    tags: normalizeTags(rawTags),
    pinned: Boolean(input.pinned),
  };
}

function sanitizeUpdatePatch(patch: UpdateNoteInput): UpdateNoteInput {
  const sanitized: UpdateNoteInput = { ...patch };
  if (patch.title !== undefined) sanitized.title = patch.title.trim();
  if (patch.body !== undefined) sanitized.body = patch.body.trim();
  if (patch.tags !== undefined) {
    const rawTags = patch.tags.map((tag) => String(tag).trim());
    sanitized.tags = normalizeTags(rawTags);
  }
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
  const rawTags = (input.tags ?? []).map((tag) => String(tag).trim());
  const errors = validateCreateNoteInput({
    title: input.title,
    body: input.body ?? '',
    tags: rawTags,
    pinned: input.pinned,
  });
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid note');
  }

  const sanitized = sanitizeCreateInput({ ...input, tags: rawTags });

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
  const validationPatch: UpdateNoteInput = { ...patch };
  if (patch.tags !== undefined) {
    validationPatch.tags = patch.tags.map((tag) => String(tag).trim());
  }
  const errors = validateUpdateNoteInput(validationPatch);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid note');
  }

  const sanitized = sanitizeUpdatePatch(patch);

  if (sanitized.pinned === true) {
    const existing = await getNote(uid, noteId);
    if (existing?.status === 'archived') {
      throw new Error('Cannot pin an archived note');
    }
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
  if (pinned) {
    const note = await getNote(uid, noteId);
    if (!note) {
      throw new Error('Note not found');
    }
    if (note.status === 'archived') {
      throw new Error('Cannot pin an archived note');
    }
  }

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
