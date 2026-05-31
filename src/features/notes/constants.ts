import type { NoteListFilter } from '@/features/notes/types';

export const MAX_NOTE_TITLE_LENGTH = 160;
export const MAX_NOTE_BODY_LENGTH = 10000;
export const MAX_NOTE_TAGS = 10;
export const MAX_NOTE_TAG_LENGTH = 24;
export const NOTE_BODY_PREVIEW_LENGTH = 120;

export const FILTER_LABELS: Record<NoteListFilter, string> = {
  active: 'Active',
  archived: 'Archived',
};
