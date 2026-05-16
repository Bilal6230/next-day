import type { TaskListFilter } from '@/features/tasks/types';

export type TasksStackParamList = {
  TasksList: { filter?: TaskListFilter } | undefined;
  TaskForm: { taskId?: string };
};
