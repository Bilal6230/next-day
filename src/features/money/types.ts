import { Timestamp } from 'firebase/firestore';

export type BillRepeatType = 'none' | 'monthly';
export type BillStatus = 'active' | 'archived';

export type Bill = {
  id: string;
  name: string;
  amountMinor: number;
  currency: string;
  repeatType: BillRepeatType;
  dueDate: Timestamp | null;
  dueDateKey: string | null;
  dueDayOfMonth: number | null;
  status: BillStatus;
  paidForMonthKey: string | null;
  paidAt: Timestamp | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type CreateBillInput = {
  name: string;
  amountMinor: number;
  currency: string;
  repeatType: BillRepeatType;
  dueDate: Date | null;
  dueDayOfMonth: number | null;
};

export type UpdateBillInput = Partial<CreateBillInput> & {
  status?: BillStatus;
};

export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Bills'
  | 'Shopping'
  | 'Family'
  | 'Health'
  | 'Learning'
  | 'Other';

export type Expense = {
  id: string;
  title: string;
  amountMinor: number;
  currency: string;
  category: ExpenseCategory;
  spentDate: Timestamp | null;
  spentDateKey: string;
  notes: string | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

export type CreateExpenseInput = {
  title: string;
  amountMinor: number;
  currency: string;
  category: ExpenseCategory;
  spentDate: Date;
  notes?: string | null;
};

export type UpdateExpenseInput = Partial<CreateExpenseInput>;
