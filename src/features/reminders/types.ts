import { Timestamp } from 'firebase/firestore';

export type ReminderCategory = 'todayFocus' | 'habits' | 'tasks' | 'bills';

export type ReminderSettings = {
  enabled: boolean;
  todayFocusEnabled: boolean;
  todayFocusTime: string | null;
  habitsEnabled: boolean;
  habitsTime: string | null;
  tasksEnabled: boolean;
  tasksTime: string | null;
  billsEnabled: boolean;
  billsTime: string | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type SaveReminderSettingsInput = {
  enabled: boolean;
  todayFocusEnabled: boolean;
  todayFocusTime: string | null;
  habitsEnabled: boolean;
  habitsTime: string | null;
  tasksEnabled: boolean;
  tasksTime: string | null;
  billsEnabled: boolean;
  billsTime: string | null;
};

export type ReminderFormValues = SaveReminderSettingsInput;

export type ReminderFieldErrors = Partial<
  Record<
    | 'todayFocusTime'
    | 'habitsTime'
    | 'tasksTime'
    | 'billsTime'
    | 'permission',
    string
  >
>;

export type ReminderDataSnapshot = {
  focusCompleted: boolean;
  focusExists: boolean;
  activeHabitsCount: number;
  incompleteHabitsCount: number;
  dueTasksCount: number;
  dueBillsCount: number;
};
