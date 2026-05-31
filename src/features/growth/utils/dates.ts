export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateKey(): string {
  return getLocalDateKey(new Date());
}

export function getYesterdayDateKey(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return getLocalDateKey(date);
}

export function getDateKeyBefore(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  return getLocalDateKey(date);
}

/** Monday-start week range in local time (inclusive date keys). */
export function getWeekRangeMondayStart(date: Date = new Date()): {
  startKey: string;
  endKey: string;
} {
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    startKey: getLocalDateKey(monday),
    endKey: getLocalDateKey(sunday),
  };
}

export function isDateKeyInRange(
  dateKey: string,
  startKey: string,
  endKey: string,
): boolean {
  return dateKey >= startKey && dateKey <= endKey;
}
