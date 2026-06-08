import { Timestamp } from 'firebase/firestore';

export type DailyFocusSourceType = 'custom' | 'task' | 'goal';

export type DailyFocus = {
  id: string;
  dateKey: string;
  sourceType: DailyFocusSourceType;
  sourceId: string | null;
  title: string;
  note: string | null;
  completed: boolean;
  completedAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type SetDailyFocusInput = {
  sourceType: DailyFocusSourceType;
  sourceId: string | null;
  title: string;
  note: string | null;
};
