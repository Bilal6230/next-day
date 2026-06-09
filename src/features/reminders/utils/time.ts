const HH_MM_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidHHmm(value: string): boolean {
  return HH_MM_PATTERN.test(value.trim());
}

export function parseHHmm(value: string): { hour: number; minute: number } | null {
  const trimmed = value.trim();
  const match = trimmed.match(HH_MM_PATTERN);
  if (!match) return null;
  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

export function formatHHmm(date: Date): string {
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}

export function hhmmToDate(value: string): Date {
  const parsed = parseHHmm(value);
  const date = new Date();
  if (!parsed) {
    date.setHours(8, 0, 0, 0);
    return date;
  }
  date.setHours(parsed.hour, parsed.minute, 0, 0);
  return date;
}
