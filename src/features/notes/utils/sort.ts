import type { Note } from '@/features/notes/types';

function timestampMillis(value: Note['updatedAt'] | Note['createdAt']): number {
  return value?.toMillis?.() ?? 0;
}

export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }
    const updatedDiff =
      timestampMillis(b.updatedAt) - timestampMillis(a.updatedAt);
    if (updatedDiff !== 0) return updatedDiff;
    return timestampMillis(b.createdAt) - timestampMillis(a.createdAt);
  });
}

export function selectQuickNote(notes: Note[]): Note | null {
  const active = notes.filter((note) => note.status === 'active');
  if (active.length === 0) return null;

  const pinnedActive = active.filter((note) => note.pinned);
  const pool = pinnedActive.length > 0 ? pinnedActive : active;
  const sorted = sortNotes(pool);
  return sorted[0] ?? null;
}
