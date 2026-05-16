import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
} from 'firebase/firestore';

import { dueDateToFields, getTodayDateKey } from '@/features/tasks/utils/dates';
import {
  validateCreateTaskInput,
  validateUpdateTaskInput,
} from '@/features/tasks/utils/validation';
import type {
  CreateTaskInput,
  Task,
  TaskListFilter,
  UpdateTaskInput,
} from '@/features/tasks/types';

import { getFirebaseDb } from './index';

const USERS_COLLECTION = 'users';
const TASKS_SUBCOLLECTION = 'tasks';

export function tasksCollectionRef(uid: string) {
  return collection(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    TASKS_SUBCOLLECTION,
  );
}

export function taskDocRef(uid: string, taskId: string) {
  return doc(getFirebaseDb(), USERS_COLLECTION, uid, TASKS_SUBCOLLECTION, taskId);
}

function mapTaskDoc(id: string, data: Record<string, unknown>): Task {
  return {
    id,
    title: String(data.title ?? ''),
    notes: data.notes == null ? null : String(data.notes),
    priority: data.priority as Task['priority'],
    status: data.status as Task['status'],
    dueDate: (data.dueDate as Task['dueDate']) ?? null,
    dueDateKey: data.dueDateKey == null ? null : String(data.dueDateKey),
    completedAt: (data.completedAt as Task['completedAt']) ?? null,
    archivedAt: (data.archivedAt as Task['archivedAt']) ?? null,
    createdAt: (data.createdAt as Task['createdAt']) ?? null,
    updatedAt: (data.updatedAt as Task['updatedAt']) ?? null,
  };
}

function mapSnapshotToTasks(
  snapshot: import('firebase/firestore').QuerySnapshot,
): Task[] {
  return snapshot.docs.map((docSnap) =>
    mapTaskDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
  );
}

function timestampMillis(value: Task['updatedAt']): number {
  return value?.toMillis?.() ?? 0;
}

function filterTasks(tasks: Task[], filter: TaskListFilter): Task[] {
  const todayKey = getTodayDateKey();

  switch (filter) {
    case 'today':
      return tasks.filter(
        (task) =>
          task.status === 'pending' &&
          task.dueDateKey != null &&
          task.dueDateKey <= todayKey,
      );
    case 'completed':
      return tasks.filter((task) => task.status === 'completed');
    case 'archived':
      return tasks.filter((task) => task.status === 'archived');
    case 'all':
    default:
      return tasks.filter(
        (task) => task.status === 'pending' || task.status === 'completed',
      );
  }
}

function sortTasks(tasks: Task[], filter: TaskListFilter): Task[] {
  const sorted = [...tasks];

  if (filter === 'today') {
    return sorted.sort((a, b) => {
      const keyCompare = (a.dueDateKey ?? '').localeCompare(b.dueDateKey ?? '');
      if (keyCompare !== 0) return keyCompare;
      return timestampMillis(b.createdAt) - timestampMillis(a.createdAt);
    });
  }

  return sorted.sort(
    (a, b) => timestampMillis(b.updatedAt) - timestampMillis(a.updatedAt),
  );
}

function processTasks(tasks: Task[], filter: TaskListFilter): Task[] {
  return sortTasks(filterTasks(tasks, filter), filter);
}

export async function getTask(
  uid: string,
  taskId: string,
): Promise<Task | null> {
  const snapshot = await getDoc(taskDocRef(uid, taskId));
  if (!snapshot.exists()) return null;
  return mapTaskDoc(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function createTask(
  uid: string,
  input: CreateTaskInput,
): Promise<string> {
  const errors = validateCreateTaskInput(input);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid task');
  }

  const ref = doc(tasksCollectionRef(uid));
  const dueFields = dueDateToFields(input.dueDate);

  await setDoc(ref, {
    title: input.title.trim(),
    notes: input.notes?.trim() ? input.notes.trim() : null,
    priority: input.priority,
    status: 'pending',
    ...dueFields,
    completedAt: null,
    archivedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateTask(
  uid: string,
  taskId: string,
  patch: UpdateTaskInput,
): Promise<void> {
  const errors = validateUpdateTaskInput(patch);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid task');
  }

  const updates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (patch.title !== undefined) {
    updates.title = patch.title.trim();
  }
  if (patch.notes !== undefined) {
    updates.notes = patch.notes?.trim() ? patch.notes.trim() : null;
  }
  if (patch.priority !== undefined) {
    updates.priority = patch.priority;
  }
  if (patch.dueDate !== undefined) {
    Object.assign(updates, dueDateToFields(patch.dueDate));
  }
  if (patch.status !== undefined) {
    updates.status = patch.status;
    if (patch.status === 'pending') {
      updates.completedAt = null;
      updates.archivedAt = null;
    }
    if (patch.status === 'completed') {
      updates.completedAt = serverTimestamp();
      updates.archivedAt = null;
    }
    if (patch.status === 'archived') {
      updates.archivedAt = serverTimestamp();
      updates.completedAt = null;
    }
  }

  await updateDoc(taskDocRef(uid, taskId), updates);
}

export async function archiveTask(uid: string, taskId: string): Promise<void> {
  await updateDoc(taskDocRef(uid, taskId), {
    status: 'archived',
    archivedAt: serverTimestamp(),
    completedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTask(uid: string, taskId: string): Promise<void> {
  await deleteDoc(taskDocRef(uid, taskId));
}

export async function markTaskCompleted(
  uid: string,
  taskId: string,
): Promise<void> {
  await updateDoc(taskDocRef(uid, taskId), {
    status: 'completed',
    completedAt: serverTimestamp(),
    archivedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function markTaskPending(
  uid: string,
  taskId: string,
): Promise<void> {
  await updateDoc(taskDocRef(uid, taskId), {
    status: 'pending',
    completedAt: null,
    archivedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToTasks(
  uid: string,
  filter: TaskListFilter,
  onData: (tasks: Task[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    tasksCollectionRef(uid),
    (snapshot) => {
      onData(processTasks(mapSnapshotToTasks(snapshot), filter));
    },
    (error) => onError(error),
  );
}

export function subscribeToTasksDueToday(
  uid: string,
  onData: (tasks: Task[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    tasksCollectionRef(uid),
    (snapshot) => {
      onData(processTasks(mapSnapshotToTasks(snapshot), 'today'));
    },
    (error) => onError(error),
  );
}
