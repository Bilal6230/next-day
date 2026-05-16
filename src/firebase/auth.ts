import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  UserCredential,
} from 'firebase/auth';

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
  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );

  await updateProfile(credential.user, {
    displayName: displayName.trim(),
  });

  await createUserDocument(credential.user.uid, {
    email: email.trim().toLowerCase(),
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
    email.trim(),
    password,
  );
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
}

export async function logOut(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export function getCurrentUser(): User | null {
  return getFirebaseAuth().currentUser;
}
