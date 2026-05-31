import {
  MAX_NOTE_TAG_LENGTH,
  MAX_NOTE_TAGS,
} from '@/features/notes/constants';

export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of tags) {
    const tag = raw.trim().toLowerCase();
    if (!tag || tag.length > MAX_NOTE_TAG_LENGTH) continue;
    if (seen.has(tag)) continue;
    seen.add(tag);
    result.push(tag);
    if (result.length >= MAX_NOTE_TAGS) break;
  }

  return result;
}

export function parseTagsInput(input: string): string[] {
  if (!input.trim()) return [];
  const parts = input.split(',').map((part) => part.trim());
  return normalizeTags(parts);
}

export function tagsToInput(tags: string[]): string {
  return tags.join(', ');
}
