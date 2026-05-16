export type FieldErrors = Partial<Record<string, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) return 'Email is required';
  if (!EMAIL_PATTERN.test(trimmed)) return 'Enter a valid email address';
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return undefined;
}

export function validateDisplayName(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) return 'Name is required';
  if (trimmed.length < 2) return 'Name must be at least 2 characters';
  return undefined;
}

export function validatePasswordMatch(
  password: string,
  confirmPassword: string,
): string | undefined {
  if (password !== confirmPassword) return 'Passwords do not match';
  return undefined;
}

export function getFirstFieldError(errors: FieldErrors): string | undefined {
  return Object.values(errors).find(Boolean);
}
