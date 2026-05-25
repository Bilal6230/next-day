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

import type {
  CreateExpenseInput,
  Expense,
  UpdateExpenseInput,
} from '@/features/money/types';
import { spentDateToFields } from '@/features/money/utils/dates';
import {
  validateCreateExpenseInput,
  validateUpdateExpenseInput,
} from '@/features/money/utils/validation';

import { getFirebaseDb } from './index';

const USERS_COLLECTION = 'users';
const EXPENSES_SUBCOLLECTION = 'expenses';

export function expensesCollectionRef(uid: string) {
  return collection(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    EXPENSES_SUBCOLLECTION,
  );
}

export function expenseDocRef(uid: string, expenseId: string) {
  return doc(
    getFirebaseDb(),
    USERS_COLLECTION,
    uid,
    EXPENSES_SUBCOLLECTION,
    expenseId,
  );
}

function mapExpenseDoc(id: string, data: Record<string, unknown>): Expense {
  return {
    id,
    title: String(data.title ?? ''),
    amountMinor: Number(data.amountMinor ?? 0),
    currency: String(data.currency ?? 'PKR'),
    category: data.category as Expense['category'],
    spentDate: (data.spentDate as Expense['spentDate']) ?? null,
    spentDateKey: String(data.spentDateKey ?? ''),
    notes: data.notes == null ? null : String(data.notes),
    createdAt: (data.createdAt as Expense['createdAt']) ?? null,
    updatedAt: (data.updatedAt as Expense['updatedAt']) ?? null,
  };
}

function mapSnapshotToExpenses(
  snapshot: import('firebase/firestore').QuerySnapshot,
): Expense[] {
  return snapshot.docs.map((docSnap) =>
    mapExpenseDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
  );
}

function sortExpensesRecent(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) =>
    b.spentDateKey.localeCompare(a.spentDateKey),
  );
}

export async function getExpense(
  uid: string,
  expenseId: string,
): Promise<Expense | null> {
  const snapshot = await getDoc(expenseDocRef(uid, expenseId));
  if (!snapshot.exists()) return null;
  return mapExpenseDoc(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function createExpense(
  uid: string,
  input: CreateExpenseInput,
): Promise<string> {
  const errors = validateCreateExpenseInput(input);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid expense');
  }

  const ref = doc(expensesCollectionRef(uid));
  const spentFields = spentDateToFields(input.spentDate);

  await setDoc(ref, {
    title: input.title.trim(),
    amountMinor: input.amountMinor,
    currency: input.currency,
    category: input.category,
    ...spentFields,
    notes: input.notes?.trim() ? input.notes.trim() : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateExpense(
  uid: string,
  expenseId: string,
  patch: UpdateExpenseInput,
): Promise<void> {
  const errors = validateUpdateExpenseInput(patch);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid expense');
  }

  const updates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (patch.title !== undefined) updates.title = patch.title.trim();
  if (patch.amountMinor !== undefined) updates.amountMinor = patch.amountMinor;
  if (patch.currency !== undefined) updates.currency = patch.currency;
  if (patch.category !== undefined) updates.category = patch.category;
  if (patch.notes !== undefined) {
    updates.notes = patch.notes?.trim() ? patch.notes.trim() : null;
  }
  if (patch.spentDate !== undefined) {
    Object.assign(updates, spentDateToFields(patch.spentDate));
  }

  await updateDoc(expenseDocRef(uid, expenseId), updates);
}

export async function deleteExpense(
  uid: string,
  expenseId: string,
): Promise<void> {
  await deleteDoc(expenseDocRef(uid, expenseId));
}

export function subscribeToExpenses(
  uid: string,
  onData: (expenses: Expense[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    expensesCollectionRef(uid),
    (snapshot) => onData(sortExpensesRecent(mapSnapshotToExpenses(snapshot))),
    (error) => onError(error),
  );
}
