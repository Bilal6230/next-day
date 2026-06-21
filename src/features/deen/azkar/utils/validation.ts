import type {
  AzkarFieldErrors,
  AzkarRoutine,
  CreateAzkarItemInput,
  UpdateAzkarItemInput,
} from '@/features/deen/azkar/types';

const MAX_TITLE_LENGTH = 80;
const MAX_PHRASE_LENGTH = 300;
const MAX_TRANSLITERATION_LENGTH = 300;
const MAX_TRANSLATION_LENGTH = 400;
const MIN_TARGET_COUNT = 1;
const MAX_TARGET_COUNT = 100000;

export function isValidAzkarRoutine(value: string): value is AzkarRoutine {
  return value === 'morning' || value === 'evening';
}

export function validateAzkarTitle(title: string): string | undefined {
  const trimmed = title.trim();
  if (!trimmed) return 'Title is required';
  if (trimmed.length > MAX_TITLE_LENGTH) {
    return `Title must be ${MAX_TITLE_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateAzkarPhrase(phrase: string): string | undefined {
  const trimmed = phrase.trim();
  if (!trimmed) return 'Phrase is required';
  if (trimmed.length > MAX_PHRASE_LENGTH) {
    return `Phrase must be ${MAX_PHRASE_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateAzkarTransliteration(
  value: string,
): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > MAX_TRANSLITERATION_LENGTH) {
    return `Transliteration must be ${MAX_TRANSLITERATION_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateAzkarTranslation(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > MAX_TRANSLATION_LENGTH) {
    return `Translation must be ${MAX_TRANSLATION_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateAzkarTargetCount(
  targetCount: number,
): string | undefined {
  if (!Number.isInteger(targetCount)) {
    return 'Target count must be a whole number';
  }
  if (targetCount < MIN_TARGET_COUNT || targetCount > MAX_TARGET_COUNT) {
    return `Target count must be between ${MIN_TARGET_COUNT} and ${MAX_TARGET_COUNT}`;
  }
  return undefined;
}

export function validateAzkarRoutine(routine: string): string | undefined {
  if (!isValidAzkarRoutine(routine)) {
    return 'Invalid azkar routine';
  }
  return undefined;
}

export function parseAzkarTargetCountInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed)) return null;
  return parsed;
}

export function validateCreateAzkarItemInput(
  input: CreateAzkarItemInput,
): AzkarFieldErrors {
  const errors: AzkarFieldErrors = {};
  const titleError = validateAzkarTitle(input.title);
  if (titleError) errors.title = titleError;
  const phraseError = validateAzkarPhrase(input.phrase);
  if (phraseError) errors.phrase = phraseError;
  const transliterationError = validateAzkarTransliteration(
    input.transliteration ?? '',
  );
  if (transliterationError) errors.transliteration = transliterationError;
  const translationError = validateAzkarTranslation(input.translation ?? '');
  if (translationError) errors.translation = translationError;
  const targetError = validateAzkarTargetCount(input.targetCount);
  if (targetError) errors.targetCount = targetError;
  return errors;
}

export function validateUpdateAzkarItemInput(
  input: UpdateAzkarItemInput,
): AzkarFieldErrors {
  const errors: AzkarFieldErrors = {};
  if (input.title !== undefined) {
    const titleError = validateAzkarTitle(input.title);
    if (titleError) errors.title = titleError;
  }
  if (input.phrase !== undefined) {
    const phraseError = validateAzkarPhrase(input.phrase);
    if (phraseError) errors.phrase = phraseError;
  }
  if (input.transliteration !== undefined) {
    const transliterationError = validateAzkarTransliteration(
      input.transliteration ?? '',
    );
    if (transliterationError) errors.transliteration = transliterationError;
  }
  if (input.translation !== undefined) {
    const translationError = validateAzkarTranslation(input.translation ?? '');
    if (translationError) errors.translation = translationError;
  }
  if (input.targetCount !== undefined) {
    const targetError = validateAzkarTargetCount(input.targetCount);
    if (targetError) errors.targetCount = targetError;
  }
  return errors;
}

export function getFirstAzkarFieldError(
  errors: AzkarFieldErrors,
): string | undefined {
  return Object.values(errors).find(Boolean);
}
