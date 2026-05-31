import { EXPENSE_CATEGORIES } from '@/features/money/constants';
import type {
  Bill,
  CreateBillInput,
  CreateExpenseInput,
  ExpenseCategory,
  UpdateBillInput,
  UpdateExpenseInput,
} from '@/features/money/types';
import { timestampToDate } from '@/features/money/utils/dates';
import { DEFAULT_CURRENCY } from '@/shared/utils/money';

export type BillFieldErrors = Partial<
  Record<'name' | 'amount' | 'dueDate' | 'dueDayOfMonth', string>
>;

export type ExpenseFieldErrors = Partial<
  Record<'title' | 'amount' | 'category' | 'spentDate', string>
>;

const MAX_NAME_LENGTH = 120;

export function validateBillName(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) return 'Name is required';
  if (trimmed.length > MAX_NAME_LENGTH) {
    return `Name must be ${MAX_NAME_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateBillAmount(amountMinor: number): string | undefined {
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    return 'Enter a valid amount greater than zero';
  }
  return undefined;
}

export function validateBillEffectiveState(input: CreateBillInput): BillFieldErrors {
  const errors: BillFieldErrors = {};
  const nameError = validateBillName(input.name);
  if (nameError) errors.name = nameError;
  const amountError = validateBillAmount(input.amountMinor);
  if (amountError) errors.amount = amountError;

  if (input.repeatType === 'none') {
    if (!input.dueDate) {
      errors.dueDate = 'Due date is required';
    }
  }

  if (input.repeatType === 'monthly') {
    if (
      input.dueDayOfMonth == null ||
      input.dueDayOfMonth < 1 ||
      input.dueDayOfMonth > 31
    ) {
      errors.dueDayOfMonth = 'Enter a day between 1 and 31';
    }
  }

  return errors;
}

export function validateCreateBillInput(input: CreateBillInput): BillFieldErrors {
  return validateBillEffectiveState(input);
}

export function billToEffectiveInput(bill: Bill): CreateBillInput {
  return {
    name: bill.name,
    amountMinor: bill.amountMinor,
    currency: bill.currency,
    repeatType: bill.repeatType,
    dueDate: timestampToDate(bill.dueDate),
    dueDayOfMonth: bill.dueDayOfMonth,
  };
}

export function mergeBillWithPatch(
  existing: Bill,
  patch: UpdateBillInput,
): CreateBillInput {
  const base = billToEffectiveInput(existing);
  return {
    name: patch.name ?? base.name,
    amountMinor: patch.amountMinor ?? base.amountMinor,
    currency: patch.currency ?? base.currency,
    repeatType: patch.repeatType ?? base.repeatType,
    dueDate: patch.dueDate !== undefined ? patch.dueDate : base.dueDate,
    dueDayOfMonth:
      patch.dueDayOfMonth !== undefined ? patch.dueDayOfMonth : base.dueDayOfMonth,
  };
}

export function validateUpdateBillInput(
  existing: Bill,
  patch: UpdateBillInput,
): BillFieldErrors {
  return validateBillEffectiveState(mergeBillWithPatch(existing, patch));
}

export function isExpenseCategory(value: string): value is ExpenseCategory {
  return EXPENSE_CATEGORIES.includes(value as ExpenseCategory);
}

export function validateExpenseTitle(title: string): string | undefined {
  const trimmed = title.trim();
  if (!trimmed) return 'Title is required';
  if (trimmed.length > MAX_NAME_LENGTH) {
    return `Title must be ${MAX_NAME_LENGTH} characters or less`;
  }
  return undefined;
}

export function validateCreateExpenseInput(
  input: CreateExpenseInput,
): ExpenseFieldErrors {
  const errors: ExpenseFieldErrors = {};
  const titleError = validateExpenseTitle(input.title);
  if (titleError) errors.title = titleError;
  const amountError = validateBillAmount(input.amountMinor);
  if (amountError) errors.amount = amountError;
  if (!isExpenseCategory(input.category)) {
    errors.category = 'Select a category';
  }
  if (!input.spentDate) {
    errors.spentDate = 'Spent date is required';
  }
  return errors;
}

export function validateUpdateExpenseInput(
  input: UpdateExpenseInput,
): ExpenseFieldErrors {
  const errors: ExpenseFieldErrors = {};
  if (input.title !== undefined) {
    const titleError = validateExpenseTitle(input.title);
    if (titleError) errors.title = titleError;
  }
  if (input.amountMinor !== undefined) {
    const amountError = validateBillAmount(input.amountMinor);
    if (amountError) errors.amount = amountError;
  }
  return errors;
}

export function getFirstFieldError(
  errors: BillFieldErrors | ExpenseFieldErrors,
): string | undefined {
  return Object.values(errors).find(Boolean);
}
