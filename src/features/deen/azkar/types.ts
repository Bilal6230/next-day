import { Timestamp } from 'firebase/firestore';

export type AzkarRoutine = 'morning' | 'evening';
export type AzkarSourceType = 'default' | 'custom';
export type AzkarStatus = 'active' | 'archived';

export type PredefinedAzkar = {
  id: string;
  title: string;
  phrase: string;
  transliteration: string | null;
  translation: string | null;
  targetCount: number;
  routine: AzkarRoutine;
  category: string;
};

export type CustomAzkarItem = {
  id: string;
  title: string;
  phrase: string;
  transliteration: string | null;
  translation: string | null;
  routine: AzkarRoutine;
  targetCount: number;
  category: string;
  status: AzkarStatus;
  archivedAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type AzkarProgress = {
  azkarItemId: string;
  dateKey: string;
  sourceType: AzkarSourceType;
  routine: AzkarRoutine;
  titleSnapshot: string;
  phraseSnapshot: string;
  targetCountSnapshot: number;
  count: number;
  completed: boolean;
  completedAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type CreateAzkarItemInput = {
  title: string;
  phrase: string;
  transliteration?: string | null;
  translation?: string | null;
  routine: AzkarRoutine;
  targetCount: number;
  category?: string;
};

export type UpdateAzkarItemInput = Partial<
  Omit<CreateAzkarItemInput, 'routine'>
>;

export type AzkarDashboardRow = {
  id: string;
  sourceType: AzkarSourceType;
  routine: AzkarRoutine;
  title: string;
  phrase: string;
  transliteration: string | null;
  translation: string | null;
  targetCount: number;
  category: string;
  completed: boolean;
  canEdit: boolean;
};

export type AzkarFormValues = {
  title: string;
  phrase: string;
  transliteration: string;
  translation: string;
  targetCount: string;
};

export type AzkarFieldErrors = Partial<
  Record<
    'title' | 'phrase' | 'transliteration' | 'translation' | 'targetCount',
    string
  >
>;

export type SetAzkarProgressInput = {
  azkarItemId: string;
  sourceType: AzkarSourceType;
  routine: AzkarRoutine;
  titleSnapshot: string;
  phraseSnapshot: string;
  targetCountSnapshot: number;
  completed: boolean;
};

export type AzkarRoutineSummary = {
  completedCount: number;
  totalCount: number;
};
