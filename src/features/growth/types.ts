import { Timestamp } from 'firebase/firestore';

export type HabitFrequency = 'daily';
export type HabitStatus = 'active' | 'archived';

export type Habit = {
  id: string;
  title: string;
  description: string | null;
  frequency: HabitFrequency;
  status: HabitStatus;
  currentStreak: number;
  bestStreak: number;
  lastCompletedDateKey: string | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type HabitCheckin = {
  dateKey: string;
  completedAt: Timestamp | null;
  createdAt: Timestamp | null;
};

export type CreateHabitInput = {
  title: string;
  description?: string | null;
};

export type UpdateHabitInput = Partial<{
  title: string;
  description: string | null;
  status: HabitStatus;
}>;

export type HabitProgressRow = {
  habit: Habit;
  isDoneToday: boolean;
};
