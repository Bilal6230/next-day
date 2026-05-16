import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { getFirebaseDb } from './index';
import type { CreateUserProfileInput, UserProfile } from './types';

const USERS_COLLECTION = 'users';

export function userDocRef(uid: string) {
  return doc(getFirebaseDb(), USERS_COLLECTION, uid);
}

export async function createUserDocument(
  uid: string,
  input: CreateUserProfileInput,
): Promise<void> {
  await setDoc(userDocRef(uid), {
    email: input.email,
    displayName: input.displayName,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserDocument(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(userDocRef(uid));
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserProfile;
}

export async function touchUserDocument(uid: string): Promise<void> {
  await updateDoc(userDocRef(uid), {
    updatedAt: serverTimestamp(),
  });
}
