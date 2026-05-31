import {
  MAX_NOTE_TAG_LENGTH,
  MAX_NOTE_TAGS,
} from '@/features/notes/constants';

/** Split comma-separated input into trimmed segments (may include empty strings). */
export function splitTagsInput(input: string): string[] {
  if (!input.trim()) return [];
  return input.split(',').map((part) => part.trim());
}

/** Non-empty trimmed tags for validation. */
export function getNonEmptyRawTags(rawTags: string[]): string[] {
  return rawTags.filter((tag) => tag.length > 0);
}

/** After validation passes: trim, lowercase, dedupe (no length/count truncation). */
export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of tags) {
    const tag = raw.trim().toLowerCase();
    if (!tag) continue;
    if (seen.has(tag)) continue;
    seen.add(tag);
    result.push(tag);
  }

  return result;
}

export function tagsToInput(tags: string[]): string {
  return tags.join(', ');
}
