import { Timestamp } from 'firebase/firestore';

export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type PrayerStatus =
  | 'pending'
  | 'on_time'
  | 'jamaah'
  | 'late'
  | 'qadha'
  | 'missed';

export type PrayerStatuses = Record<PrayerKey, PrayerStatus>;

export type PrayerLog = {
  dateKey: string;
  prayers: PrayerStatuses;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type PrayerSummary = {
  completedCount: number;
  pendingCount: number;
  missedCount: number;
  totalCount: number;
};
