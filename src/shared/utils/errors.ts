import { FirebaseError } from 'firebase/app';

const AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/email-already-in-use': 'This email is already registered.',
  'auth/weak-password': 'Password is too weak.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/network-request-failed': 'Something went wrong. Please try again.',
};

const DEFAULT_AUTH_MESSAGE = 'Something went wrong. Please try again.';

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return AUTH_MESSAGES[error.code] ?? DEFAULT_AUTH_MESSAGE;
  }
  return DEFAULT_AUTH_MESSAGE;
}

const FIRESTORE_MESSAGES: Record<string, string> = {
  'permission-denied': 'You do not have permission to access this data.',
  unavailable: 'You appear to be offline. Please try again.',
  'deadline-exceeded': 'The request took too long. Please try again.',
};

const DEFAULT_FIRESTORE_MESSAGE = 'Something went wrong. Please try again.';

export function getFirestoreErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return FIRESTORE_MESSAGES[error.code] ?? DEFAULT_FIRESTORE_MESSAGE;
  }
  return DEFAULT_FIRESTORE_MESSAGE;
}
