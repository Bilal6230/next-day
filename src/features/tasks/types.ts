import { Timestamp } from 'firebase/firestore';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'completed' | 'archived';
export type TaskListFilter = 'all' | 'today' | 'completed' | 'archived';

export const TASK_PRIORITIES: TaskPriority[] = [
  'low',
  'medium',
  'high',
  'urgent',
];

export const TASK_STATUSES: TaskStatus[] = ['pending', 'completed', 'archived'];

export const MAX_TASK_TITLE_LENGTH = 200;

export type Task = {
  id: string;
  title: string;
  notes: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Timestamp | null;
  dueDateKey: string | null;
  completedAt: Timestamp | null;
  archivedAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type CreateTaskInput = {
  title: string;
  notes?: string | null;
  priority: TaskPriority;
  dueDate: Date | null;
};

export type UpdateTaskInput = Partial<{
  title: string;
  notes: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
}>;
