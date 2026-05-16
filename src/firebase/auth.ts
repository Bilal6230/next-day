import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';

import { normalizeAuthEmail } from '@/shared/utils/email';

import { getFirebaseAuth } from './index';
import { createUserDocument } from './firestore';

export type SignUpParams = {
  email: string;
  password: string;
  displayName: string;
};

export type SignInParams = {
  email: string;
  password: string;
};

export async function signUp({
  email,
  password,
  displayName,
}: SignUpParams): Promise<UserCredential> {
  const normalizedEmail = normalizeAuthEmail(email);
  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(
    auth,
    normalizedEmail,
    password,
  );

  await updateProfile(credential.user, {
    displayName: displayName.trim(),
  });

  await createUserDocument(credential.user.uid, {
    email: normalizedEmail,
    displayName: displayName.trim(),
  });

  return credential;
}

export async function signIn({
  email,
  password,
}: SignInParams): Promise<UserCredential> {
  return signInWithEmailAndPassword(
    getFirebaseAuth(),
    normalizeAuthEmail(email),
    password,
  );
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(getFirebaseAuth(), normalizeAuthEmail(email));
}

export async function logOut(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export function getCurrentUser(): User | null {
  return getFirebaseAuth().currentUser;
}
