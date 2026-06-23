import type { PrayerKey, PrayerStatus } from '@/features/deen/prayer/types';

export const PRAYER_KEYS: PrayerKey[] = [
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
];

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export const PRAYER_STATUSES: PrayerStatus[] = [
  'pending',
  'on_time',
  'jamaah',
  'late',
  'qadha',
  'missed',
];

export const PRAYER_STATUS_LABELS: Record<PrayerStatus, string> = {
  pending: 'Pending',
  on_time: 'On time',
  jamaah: 'Jamaah',
  late: 'Late',
  qadha: 'Qadha',
  missed: 'Missed',
};

export const COMPLETED_PRAYER_STATUSES: PrayerStatus[] = [
  'on_time',
  'jamaah',
  'late',
  'qadha',
];

export const SELECTABLE_PRAYER_STATUSES: PrayerStatus[] = [
  'on_time',
  'jamaah',
  'late',
  'qadha',
  'missed',
];

export const PRAYER_TOTAL_COUNT = PRAYER_KEYS.length;

export function createDefaultPrayerStatuses(): Record<PrayerKey, PrayerStatus> {
  return {
    fajr: 'pending',
    dhuhr: 'pending',
    asr: 'pending',
    maghrib: 'pending',
    isha: 'pending',
  };
}
