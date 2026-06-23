import {
  PRAYER_KEYS,
  PRAYER_STATUSES,
} from '@/features/deen/prayer/constants';
import type { PrayerKey, PrayerStatus } from '@/features/deen/prayer/types';

export function isValidPrayerKey(value: string): value is PrayerKey {
  return PRAYER_KEYS.includes(value as PrayerKey);
}

export function isValidPrayerStatus(value: string): value is PrayerStatus {
  return PRAYER_STATUSES.includes(value as PrayerStatus);
}

export function validatePrayerKey(prayerKey: string): void {
  if (!isValidPrayerKey(prayerKey)) {
    throw new Error('Invalid prayer');
  }
}

export function validatePrayerStatus(status: string): void {
  if (!isValidPrayerStatus(status)) {
    throw new Error('Invalid prayer status');
  }
}

export function normalizePrayerStatus(value: unknown): PrayerStatus {
  const status = String(value ?? 'pending');
  return isValidPrayerStatus(status) ? status : 'pending';
}
