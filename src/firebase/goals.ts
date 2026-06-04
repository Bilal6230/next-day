import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  updateDoc,
} from 'firebase/firestore';

import { targetDateToFields } from '@/features/growth/goals/utils/dates';
import {
  validateCreateGoalInput,
  validateUpdateGoalInput,
} from '@/features/growth/goals/utils/validation';
import type {
  CreateGoalInput,
  Goal,
  UpdateGoalInput,
} from '@/features/growth/goals/types';

import { getFirebaseDb } from './index';

const USERS_COLLECTION = 'users';
const GOALS_SUBCOLLECTION = 'goals';

export function goalsCollectionRef(uid: string) {
  return collection(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    GOALS_SUBCOLLECTION,
  );
}

export function goalDocRef(uid: string, goalId: string) {
  return doc(getFirebaseDb(), USERS_COLLECTION, uid, GOALS_SUBCOLLECTION, goalId);
}

function mapGoalDoc(id: string, data: Record<string, unknown>): Goal {
  return {
    id,
    title: String(data.title ?? ''),
    description: data.description == null ? null : String(data.description),
    category: data.category as Goal['category'],
    progressPercent: Number(data.progressPercent ?? 0),
    targetDate: (data.targetDate as Goal['targetDate']) ?? null,
    targetDateKey:
      data.targetDateKey == null ? null : String(data.targetDateKey),
    status:
      data.status === 'completed' || data.status === 'archived'
        ? data.status
        : 'active',
    completedAt: (data.completedAt as Goal['completedAt']) ?? null,
    archivedAt: (data.archivedAt as Goal['archivedAt']) ?? null,
    createdAt: (data.createdAt as Goal['createdAt']) ?? null,
    updatedAt: (data.updatedAt as Goal['updatedAt']) ?? null,
  };
}

function applyTargetDatePatch(
  updates: Record<string, unknown>,
  targetDate: Date | null | undefined,
): void {
  if (targetDate === undefined) return;
  Object.assign(updates, targetDateToFields(targetDate));
}

export async function getGoal(
  uid: string,
  goalId: string,
): Promise<Goal | null> {
  const snapshot = await getDoc(goalDocRef(uid, goalId));
  if (!snapshot.exists()) return null;
  return mapGoalDoc(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function createGoal(
  uid: string,
  input: CreateGoalInput,
): Promise<string> {
  const errors = validateCreateGoalInput(input);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid goal');
  }

  const targetFields = targetDateToFields(input.targetDate);
  const ref = doc(goalsCollectionRef(uid));

  await setDoc(ref, {
    title: input.title.trim(),
    description: input.description?.trim() ? input.description.trim() : null,
    category: input.category,
    progressPercent: input.progressPercent,
    ...targetFields,
    status: 'active',
    completedAt: null,
    archivedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateGoal(
  uid: string,
  goalId: string,
  patch: UpdateGoalInput,
): Promise<void> {
  const errors = validateUpdateGoalInput(patch);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid goal');
  }

  const updates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (patch.title !== undefined) updates.title = patch.title.trim();
  if (patch.description !== undefined) {
    updates.description = patch.description?.trim()
      ? patch.description.trim()
      : null;
  }
  if (patch.category !== undefined) updates.category = patch.category;
  if (patch.progressPercent !== undefined) {
    updates.progressPercent = patch.progressPercent;
  }
  applyTargetDatePatch(updates, patch.targetDate);

  await updateDoc(goalDocRef(uid, goalId), updates);
}

export async function archiveGoal(uid: string, goalId: string): Promise<void> {
  const goal = await getGoal(uid, goalId);
  if (!goal) throw new Error('Goal not found');
  if (goal.status === 'archived') return;

  await updateDoc(goalDocRef(uid, goalId), {
    status: 'archived',
    archivedAt: serverTimestamp(),
    completedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function markGoalCompleted(
  uid: string,
  goalId: string,
): Promise<void> {
  const goal = await getGoal(uid, goalId);
  if (!goal) throw new Error('Goal not found');
  if (goal.status === 'archived') {
    throw new Error('Cannot complete an archived goal');
  }
  if (goal.status === 'completed') return;

  await updateDoc(goalDocRef(uid, goalId), {
    status: 'completed',
    completedAt: serverTimestamp(),
    archivedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function markGoalActive(uid: string, goalId: string): Promise<void> {
  const goal = await getGoal(uid, goalId);
  if (!goal) throw new Error('Goal not found');
  if (goal.status === 'archived') {
    throw new Error('Archived goals cannot be reopened');
  }
  if (goal.status !== 'completed') return;

  await updateDoc(goalDocRef(uid, goalId), {
    status: 'active',
    completedAt: null,
    archivedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToGoals(
  uid: string,
  onData: (goals: Goal[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    goalsCollectionRef(uid),
    (snapshot) => {
      const goals = snapshot.docs.map((docSnap) =>
        mapGoalDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
      );
      onData(goals);
    },
    (error) => onError(error),
  );
}
