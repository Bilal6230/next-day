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

const SAFE_DOMAIN_ERROR_MESSAGES = new Set([
  'Archived goals cannot be reopened',
  'Bill not found',
  'Cannot complete an archived goal',
  'Cannot pin an archived note',
  'Custom focus cannot have a source ID',
  'Due date is required',
  'Enter a day between 1 and 31',
  'Enter a valid amount greater than zero',
  'Goal not found',
  'Habit not found',
  'Invalid bill',
  'Invalid expense',
  'Invalid focus',
  'Invalid focus source',
  'Invalid goal',
  'Invalid habit',
  'Invalid note',
  'Invalid status',
  'Invalid task',
  'Name is required',
  'No focus set for today',
  'Note is only allowed for custom focus',
  'Note not found',
  'Progress must be a whole number from 0 to 100',
  'Source ID is required',
  'Title is required',
  'Use goal lifecycle actions to change status.',
]);

const SAFE_DOMAIN_ERROR_PATTERNS = [
  /^Title must be \d+ characters or less$/,
  /^Body must be \d+ characters or less$/,
  /^Note must be \d+ characters or less$/,
  /^Name must be \d+ characters or less$/,
  /^Each tag must be \d+ characters or less$/,
  /^Maximum \d+ tags allowed$/,
];

function isSafeDomainErrorMessage(message: string): boolean {
  if (SAFE_DOMAIN_ERROR_MESSAGES.has(message)) return true;
  return SAFE_DOMAIN_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

export function getFirestoreErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return FIRESTORE_MESSAGES[error.code] ?? DEFAULT_FIRESTORE_MESSAGE;
  }
  if (error instanceof Error) {
    const message = error.message.trim();
    if (message && isSafeDomainErrorMessage(message)) {
      return message;
    }
  }
  return DEFAULT_FIRESTORE_MESSAGE;
}
