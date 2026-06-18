import type {
  CreateDhikrInput,
  DhikrFieldErrors,
  UpdateDhikrInput,
} from '@/features/deen/types';

const MAX_TITLE_LENGTH = 80;
const MAX_PHRASE_LENGTH = 200;
const MAX_TRANSLITERATION_LENGTH = 200;
const MAX_TRANSLATION_LENGTH = 300;
const MIN_TARGET_COUNT = 1;
const MAX_TARGET_COUNT = 100000;

export function validateDhikrTitle(title: string): string | undefined {
  const trimmed = title.trim();
  if (!trimmed) return 'Title is required';
  if (trimmed.length > MAX_TITLE_LENGTH) {
    return `Title must be ${MAX_TITLE_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateDhikrPhrase(phrase: string): string | undefined {
  const trimmed = phrase.trim();
  if (!trimmed) return 'Phrase is required';
  if (trimmed.length > MAX_PHRASE_LENGTH) {
    return `Phrase must be ${MAX_PHRASE_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateDhikrTransliteration(
  value: string,
): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > MAX_TRANSLITERATION_LENGTH) {
    return `Transliteration must be ${MAX_TRANSLITERATION_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateDhikrTranslation(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > MAX_TRANSLATION_LENGTH) {
    return `Translation must be ${MAX_TRANSLATION_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateDhikrTargetCount(
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

export function parseDhikrTargetCountInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed)) return null;
  return parsed;
}

export function validateCreateDhikrInput(
  input: CreateDhikrInput,
): DhikrFieldErrors {
  const errors: DhikrFieldErrors = {};
  const titleError = validateDhikrTitle(input.title);
  if (titleError) errors.title = titleError;
  const phraseError = validateDhikrPhrase(input.phrase);
  if (phraseError) errors.phrase = phraseError;
  const transliterationError = validateDhikrTransliteration(
    input.transliteration ?? '',
  );
  if (transliterationError) errors.transliteration = transliterationError;
  const translationError = validateDhikrTranslation(input.translation ?? '');
  if (translationError) errors.translation = translationError;
  const targetError = validateDhikrTargetCount(input.targetCount);
  if (targetError) errors.targetCount = targetError;
  return errors;
}

export function validateUpdateDhikrInput(
  input: UpdateDhikrInput,
): DhikrFieldErrors {
  const errors: DhikrFieldErrors = {};
  if (input.title !== undefined) {
    const titleError = validateDhikrTitle(input.title);
    if (titleError) errors.title = titleError;
  }
  if (input.phrase !== undefined) {
    const phraseError = validateDhikrPhrase(input.phrase);
    if (phraseError) errors.phrase = phraseError;
  }
  if (input.transliteration !== undefined) {
    const transliterationError = validateDhikrTransliteration(
      input.transliteration ?? '',
    );
    if (transliterationError) errors.transliteration = transliterationError;
  }
  if (input.translation !== undefined) {
    const translationError = validateDhikrTranslation(input.translation ?? '');
    if (translationError) errors.translation = translationError;
  }
  if (input.targetCount !== undefined) {
    const targetError = validateDhikrTargetCount(input.targetCount);
    if (targetError) errors.targetCount = targetError;
  }
  return errors;
}

export function getFirstDhikrFieldError(
  errors: DhikrFieldErrors,
): string | undefined {
  return Object.values(errors).find(Boolean);
}
