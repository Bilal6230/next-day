import { Timestamp } from 'firebase/firestore';

export type GoalStatus = 'active' | 'completed' | 'archived';
export type GoalListFilter = 'active' | 'completed' | 'archived';

export type GoalCategory =
  | 'personal'
  | 'work'
  | 'finance'
  | 'health'
  | 'learning'
  | 'spiritual'
  | 'other';

export type Goal = {
  id: string;
  title: string;
  description: string | null;
  category: GoalCategory;
  progressPercent: number;
  targetDate: Timestamp | null;
  targetDateKey: string | null;
  status: GoalStatus;
  completedAt: Timestamp | null;
  archivedAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type CreateGoalInput = {
  title: string;
  description?: string | null;
  category: GoalCategory;
  progressPercent: number;
  targetDate: Date | null;
};

export type UpdateGoalInput = Partial<{
  title: string;
  description: string | null;
  category: GoalCategory;
  progressPercent: number;
  targetDate: Date | null;
  status: GoalStatus;
}>;
