import {
  MAX_TASK_TITLE_LENGTH,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type CreateTaskInput,
  type TaskPriority,
  type TaskStatus,
  type UpdateTaskInput,
} from '@/features/tasks/types';

export type TaskFieldErrors = Partial<
  Record<'title' | 'notes' | 'priority' | 'status', string>
>;

export function isTaskPriority(value: string): value is TaskPriority {
  return TASK_PRIORITIES.includes(value as TaskPriority);
}

export function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}

export function validateTaskTitle(title: string): string | undefined {
  const trimmed = title.trim();
  if (!trimmed) return 'Title is required';
  if (trimmed.length > MAX_TASK_TITLE_LENGTH) {
    return `Title must be ${MAX_TASK_TITLE_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateCreateTaskInput(
  input: CreateTaskInput,
): TaskFieldErrors {
  const errors: TaskFieldErrors = {};
  const titleError = validateTaskTitle(input.title);
  if (titleError) errors.title = titleError;
  if (!isTaskPriority(input.priority)) {
    errors.priority = 'Invalid priority';
  }
  return errors;
}

export function validateUpdateTaskInput(
  input: UpdateTaskInput,
): TaskFieldErrors {
  const errors: TaskFieldErrors = {};
  if (input.title !== undefined) {
    const titleError = validateTaskTitle(input.title);
    if (titleError) errors.title = titleError;
  }
  if (input.priority !== undefined && !isTaskPriority(input.priority)) {
    errors.priority = 'Invalid priority';
  }
  if (input.status !== undefined && !isTaskStatus(input.status)) {
    errors.status = 'Invalid status';
  }
  return errors;
}

export function getFirstTaskFieldError(
  errors: TaskFieldErrors,
): string | undefined {
  return Object.values(errors).find(Boolean);
}
