import type { Note, NoteListFilter } from '@/features/notes/types';

export function filterNotesByStatus(
  notes: Note[],
  statusFilter: NoteListFilter,
): Note[] {
  return notes.filter((note) => note.status === statusFilter);
}

export function filterNotesBySearch(notes: Note[], search: string): Note[] {
  const query = search.trim().toLowerCase();
  if (!query) return notes;

  return notes.filter((note) => {
    if (note.title.toLowerCase().includes(query)) return true;
    if (note.body.toLowerCase().includes(query)) return true;
    return note.tags.some((tag) => tag.includes(query));
  });
}

export function filterNotes(
  notes: Note[],
  statusFilter: NoteListFilter,
  search: string,
): Note[] {
  return filterNotesBySearch(filterNotesByStatus(notes, statusFilter), search);
}
