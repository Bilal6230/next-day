import { Timestamp } from 'firebase/firestore';

export type DhikrSourceType = 'default' | 'custom';
export type DhikrStatus = 'active' | 'archived';

export type PredefinedDhikr = {
  id: string;
  title: string;
  phrase: string;
  transliteration: string | null;
  translation: string | null;
  targetCount: number;
  category: string;
};

export type CustomDhikr = {
  id: string;
  title: string;
  phrase: string;
  transliteration: string | null;
  translation: string | null;
  targetCount: number;
  category: string;
  status: DhikrStatus;
  archivedAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type DhikrProgress = {
  dhikrId: string;
  dateKey: string;
  sourceType: DhikrSourceType;
  titleSnapshot: string;
  phraseSnapshot: string;
  targetCountSnapshot: number;
  count: number;
  completed: boolean;
  completedAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type CreateDhikrInput = {
  title: string;
  phrase: string;
  transliteration?: string | null;
  translation?: string | null;
  targetCount: number;
  category?: string;
};

export type UpdateDhikrInput = Partial<CreateDhikrInput>;

export type DhikrDashboardRow = {
  id: string;
  sourceType: DhikrSourceType;
  title: string;
  phrase: string;
  transliteration: string | null;
  translation: string | null;
  targetCount: number;
  category: string;
  count: number;
  completed: boolean;
  canEdit: boolean;
};

export type DhikrFormValues = {
  title: string;
  phrase: string;
  transliteration: string;
  translation: string;
  targetCount: string;
};

export type DhikrFieldErrors = Partial<
  Record<'title' | 'phrase' | 'transliteration' | 'translation' | 'targetCount', string>
>;

export type SetDhikrProgressCountInput = {
  dhikrId: string;
  sourceType: DhikrSourceType;
  titleSnapshot: string;
  phraseSnapshot: string;
  targetCountSnapshot: number;
  count: number;
};
