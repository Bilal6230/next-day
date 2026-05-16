/** Normalize email for Firebase Auth and stored user profile fields. */
export function normalizeAuthEmail(email: string): string {
  return email.trim().toLowerCase();
}
