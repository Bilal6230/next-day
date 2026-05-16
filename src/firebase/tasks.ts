import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';

import {
  dueDateToFields,
  getTodayDateKey,
} from '@/features/tasks/utils/dates';
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

function buildTaskQuery(uid: string, filter: TaskListFilter) {
  const col = tasksCollectionRef(uid);
  const todayKey = getTodayDateKey();

  switch (filter) {
    case 'today':
      return query(
        col,
        where('status', '==', 'pending'),
        where('dueDateKey', '<=', todayKey),
        orderBy('dueDateKey', 'asc'),
        orderBy('createdAt', 'desc'),
      );
    case 'completed':
      return query(
        col,
        where('status', '==', 'completed'),
        orderBy('updatedAt', 'desc'),
      );
    case 'archived':
      return query(
        col,
        where('status', '==', 'archived'),
        orderBy('updatedAt', 'desc'),
      );
    case 'all':
    default:
      return query(
        col,
        where('status', 'in', ['pending', 'completed']),
        orderBy('updatedAt', 'desc'),
      );
  }
}

function buildTasksDueTodayQuery(uid: string) {
  const todayKey = getTodayDateKey();
  return query(
    tasksCollectionRef(uid),
    where('status', '==', 'pending'),
    where('dueDateKey', '<=', todayKey),
    orderBy('dueDateKey', 'asc'),
    orderBy('createdAt', 'desc'),
  );
}

function mapSnapshotToTasks(
  snapshot: import('firebase/firestore').QuerySnapshot,
): Task[] {
  return snapshot.docs.map((docSnap) =>
    mapTaskDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
  );
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
    }
  }

  await updateDoc(taskDocRef(uid, taskId), updates);
}

export async function archiveTask(uid: string, taskId: string): Promise<void> {
  await updateDoc(taskDocRef(uid, taskId), {
    status: 'archived',
    archivedAt: serverTimestamp(),
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
  const q = buildTaskQuery(uid, filter);

  return onSnapshot(
    q,
    (snapshot) => {
      let tasks = mapSnapshotToTasks(snapshot);
      if (filter === 'today') {
        const todayKey = getTodayDateKey();
        tasks = tasks.filter(
          (task) =>
            task.status === 'pending' &&
            task.dueDateKey != null &&
            task.dueDateKey <= todayKey,
        );
      }
      onData(tasks);
    },
    (error) => onError(error),
  );
}

export function subscribeToTasksDueToday(
  uid: string,
  onData: (tasks: Task[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = buildTasksDueTodayQuery(uid);
  const todayKey = getTodayDateKey();

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = mapSnapshotToTasks(snapshot).filter(
        (task) =>
          task.status === 'pending' &&
          task.dueDateKey != null &&
          task.dueDateKey <= todayKey,
      );
      onData(tasks);
    },
    (error) => onError(error),
  );
}
