import { FirebaseError } from 'firebase/app';

const AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'That email address is not valid.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Try again.',
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/email-already-in-use': 'An account already exists with this email.',
  'auth/weak-password': 'Choose a stronger password (at least 8 characters).',
  'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
  'auth/network-request-failed': 'Network error. Check your connection.',
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError && AUTH_MESSAGES[error.code]) {
    return AUTH_MESSAGES[error.code];
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
