import {
  MAX_NOTE_BODY_LENGTH,
  MAX_NOTE_TAGS,
  MAX_NOTE_TAG_LENGTH,
  MAX_NOTE_TITLE_LENGTH,
} from '@/features/notes/constants';
import { getNonEmptyRawTags } from '@/features/notes/utils/tags';
import type { CreateNoteInput, NoteStatus, UpdateNoteInput } from '@/features/notes/types';

export type NoteFieldErrors = Partial<
  Record<'title' | 'body' | 'tags' | 'pinned' | 'status', string>
>;

const NOTE_STATUSES: NoteStatus[] = ['active', 'archived'];

export function isNoteStatus(value: string): value is NoteStatus {
  return NOTE_STATUSES.includes(value as NoteStatus);
}

export function validateNoteTitle(title: string): string | undefined {
  const trimmed = title.trim();
  if (!trimmed) return 'Title is required';
  if (trimmed.length > MAX_NOTE_TITLE_LENGTH) {
    return `Title must be ${MAX_NOTE_TITLE_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateNoteBody(body: string): string | undefined {
  if (body.length > MAX_NOTE_BODY_LENGTH) {
    return `Body must be ${MAX_NOTE_BODY_LENGTH} characters or less`;
  }
  return undefined;
}

/** Validate raw trimmed tags before normalization. */
export function validateNoteTags(rawTags: string[]): string | undefined {
  const nonEmpty = getNonEmptyRawTags(rawTags);

  for (const tag of nonEmpty) {
    if (tag.length > MAX_NOTE_TAG_LENGTH) {
      return `Each tag must be ${MAX_NOTE_TAG_LENGTH} characters or less`;
    }
  }

  if (nonEmpty.length > MAX_NOTE_TAGS) {
    return `Maximum ${MAX_NOTE_TAGS} tags allowed`;
  }

  return undefined;
}

export function validateCreateNoteInput(input: CreateNoteInput): NoteFieldErrors {
  const errors: NoteFieldErrors = {};
  const titleError = validateNoteTitle(input.title);
  if (titleError) errors.title = titleError;
  const bodyError = validateNoteBody(input.body ?? '');
  if (bodyError) errors.body = bodyError;
  const tagsError = validateNoteTags(input.tags ?? []);
  if (tagsError) errors.tags = tagsError;
  return errors;
}

export function validateUpdateNoteInput(input: UpdateNoteInput): NoteFieldErrors {
  const errors: NoteFieldErrors = {};
  if (input.title !== undefined) {
    const titleError = validateNoteTitle(input.title);
    if (titleError) errors.title = titleError;
  }
  if (input.body !== undefined) {
    const bodyError = validateNoteBody(input.body);
    if (bodyError) errors.body = bodyError;
  }
  if (input.tags !== undefined) {
    const tagsError = validateNoteTags(input.tags);
    if (tagsError) errors.tags = tagsError;
  }
  if (input.status !== undefined && !isNoteStatus(input.status)) {
    errors.status = 'Invalid status';
  }
  return errors;
}

export function getFirstNoteFieldError(
  errors: NoteFieldErrors,
): string | undefined {
  return Object.values(errors).find(Boolean);
}
