import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  deleteDoc,
  Unsubscribe,
  updateDoc,
} from 'firebase/firestore';

import { HABIT_FREQUENCY_DAILY } from '@/features/growth/constants';
import type {
  CreateHabitInput,
  Habit,
  HabitCheckin,
  UpdateHabitInput,
} from '@/features/growth/types';
import { getTodayDateKey } from '@/features/growth/utils/dates';
import { computeStreakStats } from '@/features/growth/utils/streaks';
import {
  validateCreateHabitInput,
  validateUpdateHabitInput,
} from '@/features/growth/utils/validation';

import { getFirebaseDb } from './index';

const USERS_COLLECTION = 'users';
const HABITS_SUBCOLLECTION = 'habits';
const CHECKINS_SUBCOLLECTION = 'checkins';

export function habitsCollectionRef(uid: string) {
  return collection(getFirebaseDb(), USERS_COLLECTION, uid, HABITS_SUBCOLLECTION);
}

export function habitDocRef(uid: string, habitId: string) {
  return doc(getFirebaseDb(), USERS_COLLECTION, uid, HABITS_SUBCOLLECTION, habitId);
}

export function habitCheckinsCollectionRef(uid: string, habitId: string) {
  return collection(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    HABITS_SUBCOLLECTION,
    habitId,
    CHECKINS_SUBCOLLECTION,
  );
}

export function habitCheckinDocRef(
  uid: string,
  habitId: string,
  dateKey: string,
) {
  return doc(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    HABITS_SUBCOLLECTION,
    habitId,
    CHECKINS_SUBCOLLECTION,
    dateKey,
  );
}

function mapHabitDoc(id: string, data: Record<string, unknown>): Habit {
  return {
    id,
    title: String(data.title ?? ''),
    description: data.description == null ? null : String(data.description),
    frequency: HABIT_FREQUENCY_DAILY,
    status: data.status as Habit['status'],
    currentStreak: Number(data.currentStreak ?? 0),
    bestStreak: Number(data.bestStreak ?? 0),
    lastCompletedDateKey:
      data.lastCompletedDateKey == null
        ? null
        : String(data.lastCompletedDateKey),
    createdAt: (data.createdAt as Habit['createdAt']) ?? null,
    updatedAt: (data.updatedAt as Habit['updatedAt']) ?? null,
  };
}

function mapCheckinDoc(
  id: string,
  data: Record<string, unknown>,
): HabitCheckin {
  return {
    dateKey: String(data.dateKey ?? id),
    completedAt: (data.completedAt as HabitCheckin['completedAt']) ?? null,
    createdAt: (data.createdAt as HabitCheckin['createdAt']) ?? null,
  };
}

export async function getHabit(
  uid: string,
  habitId: string,
): Promise<Habit | null> {
  const snapshot = await getDoc(habitDocRef(uid, habitId));
  if (!snapshot.exists()) return null;
  return mapHabitDoc(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function getHabitCheckinDateKeys(
  uid: string,
  habitId: string,
): Promise<string[]> {
  const snapshot = await getDocs(habitCheckinsCollectionRef(uid, habitId));
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Record<string, unknown>;
    return String(data.dateKey ?? docSnap.id);
  });
}

async function syncHabitStreakFields(uid: string, habitId: string): Promise<void> {
  const dateKeys = await getHabitCheckinDateKeys(uid, habitId);
  const stats = computeStreakStats(dateKeys);
  await updateDoc(habitDocRef(uid, habitId), {
    currentStreak: stats.currentStreak,
    bestStreak: stats.bestStreak,
    lastCompletedDateKey: stats.lastCompletedDateKey,
    updatedAt: serverTimestamp(),
  });
}

export async function createHabit(
  uid: string,
  input: CreateHabitInput,
): Promise<string> {
  const errors = validateCreateHabitInput(input);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid habit');
  }

  const ref = doc(habitsCollectionRef(uid));
  await setDoc(ref, {
    title: input.title.trim(),
    description: input.description?.trim() ? input.description.trim() : null,
    frequency: HABIT_FREQUENCY_DAILY,
    status: 'active',
    currentStreak: 0,
    bestStreak: 0,
    lastCompletedDateKey: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateHabit(
  uid: string,
  habitId: string,
  patch: UpdateHabitInput,
): Promise<void> {
  const errors = validateUpdateHabitInput(patch);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid habit');
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
  if (patch.status !== undefined) updates.status = patch.status;

  await updateDoc(habitDocRef(uid, habitId), updates);
}

export async function archiveHabit(uid: string, habitId: string): Promise<void> {
  await updateDoc(habitDocRef(uid, habitId), {
    status: 'archived',
    updatedAt: serverTimestamp(),
  });
}

export async function markHabitDoneToday(
  uid: string,
  habitId: string,
): Promise<void> {
  const habit = await getHabit(uid, habitId);
  if (!habit || habit.status !== 'active') {
    throw new Error('Habit not found');
  }

  const todayKey = getTodayDateKey();
  const existing = await getDoc(habitCheckinDocRef(uid, habitId, todayKey));
  if (existing.exists()) {
    return;
  }

  await setDoc(habitCheckinDocRef(uid, habitId, todayKey), {
    dateKey: todayKey,
    completedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });

  await syncHabitStreakFields(uid, habitId);
}

export async function undoHabitDoneToday(
  uid: string,
  habitId: string,
): Promise<void> {
  const todayKey = getTodayDateKey();
  const existing = await getDoc(habitCheckinDocRef(uid, habitId, todayKey));
  if (!existing.exists()) {
    return;
  }

  await deleteDoc(habitCheckinDocRef(uid, habitId, todayKey));
  await syncHabitStreakFields(uid, habitId);
}

export function subscribeToHabits(
  uid: string,
  onData: (habits: Habit[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    habitsCollectionRef(uid),
    (snapshot) => {
      const habits = snapshot.docs.map((docSnap) =>
        mapHabitDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
      );
      onData(habits);
    },
    (error) => onError(error),
  );
}

export function subscribeToHabitCheckins(
  uid: string,
  habitId: string,
  onData: (checkins: HabitCheckin[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    habitCheckinsCollectionRef(uid, habitId),
    (snapshot) => {
      const checkins = snapshot.docs.map((docSnap) =>
        mapCheckinDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
      );
      onData(checkins);
    },
    (error) => onError(error),
  );
}
