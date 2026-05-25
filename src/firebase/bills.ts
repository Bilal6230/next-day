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
  Bill,
  CreateBillInput,
  UpdateBillInput,
} from '@/features/money/types';
import {
  dueDateToFields,
  getCurrentMonthKey,
} from '@/features/money/utils/dates';
import {
  mergeBillWithPatch,
  validateCreateBillInput,
  validateUpdateBillInput,
} from '@/features/money/utils/validation';

import { getFirebaseDb } from './index';

const USERS_COLLECTION = 'users';
const BILLS_SUBCOLLECTION = 'bills';

export function billsCollectionRef(uid: string) {
  return collection(getFirebaseDb(), USERS_COLLECTION, uid, BILLS_SUBCOLLECTION);
}

export function billDocRef(uid: string, billId: string) {
  return doc(getFirebaseDb(), USERS_COLLECTION, uid, BILLS_SUBCOLLECTION, billId);
}

function mapBillDoc(id: string, data: Record<string, unknown>): Bill {
  return {
    id,
    name: String(data.name ?? ''),
    amountMinor: Number(data.amountMinor ?? 0),
    currency: String(data.currency ?? 'PKR'),
    repeatType: data.repeatType as Bill['repeatType'],
    dueDate: (data.dueDate as Bill['dueDate']) ?? null,
    dueDateKey: data.dueDateKey == null ? null : String(data.dueDateKey),
    dueDayOfMonth:
      data.dueDayOfMonth == null ? null : Number(data.dueDayOfMonth),
    status: data.status as Bill['status'],
    paidForMonthKey:
      data.paidForMonthKey == null ? null : String(data.paidForMonthKey),
    paidAt: (data.paidAt as Bill['paidAt']) ?? null,
    createdAt: (data.createdAt as Bill['createdAt']) ?? null,
    updatedAt: (data.updatedAt as Bill['updatedAt']) ?? null,
  };
}

function mapSnapshotToBills(
  snapshot: import('firebase/firestore').QuerySnapshot,
): Bill[] {
  return snapshot.docs.map((docSnap) =>
    mapBillDoc(docSnap.id, docSnap.data() as Record<string, unknown>),
  );
}

export async function getBill(
  uid: string,
  billId: string,
): Promise<Bill | null> {
  const snapshot = await getDoc(billDocRef(uid, billId));
  if (!snapshot.exists()) return null;
  return mapBillDoc(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function createBill(
  uid: string,
  input: CreateBillInput,
): Promise<string> {
  const errors = validateCreateBillInput(input);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid bill');
  }

  const ref = doc(billsCollectionRef(uid));
  const dueFields =
    input.repeatType === 'monthly'
      ? {
          dueDate: null,
          dueDateKey: null,
          dueDayOfMonth: input.dueDayOfMonth,
        }
      : { ...dueDateToFields(input.dueDate), dueDayOfMonth: null };

  await setDoc(ref, {
    name: input.name.trim(),
    amountMinor: input.amountMinor,
    currency: input.currency,
    repeatType: input.repeatType,
    ...dueFields,
    status: 'active',
    paidForMonthKey: null,
    paidAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateBill(
  uid: string,
  billId: string,
  patch: UpdateBillInput,
): Promise<void> {
  const existing = await getBill(uid, billId);
  if (!existing) throw new Error('Bill not found');

  const effective = mergeBillWithPatch(existing, patch);
  const errors = validateUpdateBillInput(existing, patch);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors).find(Boolean) ?? 'Invalid bill');
  }

  const updates: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (patch.name !== undefined) updates.name = effective.name.trim();
  if (patch.amountMinor !== undefined) updates.amountMinor = effective.amountMinor;
  if (patch.currency !== undefined) updates.currency = effective.currency;
  if (patch.repeatType !== undefined) updates.repeatType = effective.repeatType;
  if (patch.status !== undefined) updates.status = patch.status;

  if (
    patch.repeatType !== undefined ||
    patch.dueDayOfMonth !== undefined ||
    patch.dueDate !== undefined
  ) {
    if (effective.repeatType === 'monthly') {
      Object.assign(updates, {
        dueDate: null,
        dueDateKey: null,
        dueDayOfMonth: effective.dueDayOfMonth,
      });
    } else {
      Object.assign(updates, dueDateToFields(effective.dueDate));
      updates.dueDayOfMonth = null;
    }
  }

  await updateDoc(billDocRef(uid, billId), updates);
}

export async function archiveBill(uid: string, billId: string): Promise<void> {
  await updateDoc(billDocRef(uid, billId), {
    status: 'archived',
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBill(uid: string, billId: string): Promise<void> {
  await deleteDoc(billDocRef(uid, billId));
}

export async function markBillPaid(uid: string, billId: string): Promise<void> {
  const bill = await getBill(uid, billId);
  if (!bill) throw new Error('Bill not found');

  if (bill.repeatType === 'monthly') {
    await updateDoc(billDocRef(uid, billId), {
      paidForMonthKey: getCurrentMonthKey(),
      paidAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return;
  }

  await updateDoc(billDocRef(uid, billId), {
    paidAt: serverTimestamp(),
    paidForMonthKey: null,
    updatedAt: serverTimestamp(),
  });
}

export async function markBillUnpaid(
  uid: string,
  billId: string,
): Promise<void> {
  await updateDoc(billDocRef(uid, billId), {
    paidForMonthKey: null,
    paidAt: null,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToBills(
  uid: string,
  onData: (bills: Bill[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    billsCollectionRef(uid),
    (snapshot) => onData(mapSnapshotToBills(snapshot)),
    (error) => onError(error),
  );
}
