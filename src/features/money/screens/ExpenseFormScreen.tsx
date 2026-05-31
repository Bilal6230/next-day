import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '@/app/providers/AuthProvider';
import {
  ExpenseForm,
  type ExpenseFormValues,
} from '@/features/money/components/ExpenseForm';
import { DEFAULT_CURRENCY } from '@/features/money/constants';
import type { MoneyStackParamList } from '@/features/money/navigation/types';
import { dateAtLocalMidnight } from '@/features/money/utils/dates';
import { timestampToDate } from '@/features/money/utils/dates';
import {
  getFirstFieldError,
  validateCreateExpenseInput,
  type ExpenseFieldErrors,
} from '@/features/money/utils/validation';
import {
  createExpense,
  deleteExpense,
  getExpense,
  updateExpense,
} from '@/firebase/expenses';
import { Button, ErrorMessage, Screen } from '@/shared/components';
import {
  amountMinorToInputString,
  parseMoneyInput,
} from '@/shared/utils/money';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type ExpenseFormRoute = RouteProp<MoneyStackParamList, 'ExpenseForm'>;
type ExpenseFormNavigation = NativeStackNavigationProp<
  MoneyStackParamList,
  'ExpenseForm'
>;

const DEFAULT_VALUES: ExpenseFormValues = {
  title: '',
  amountInput: '',
  category: 'Other',
  spentDate: dateAtLocalMidnight(new Date()),
  notes: '',
};

export function ExpenseFormScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<ExpenseFormNavigation>();
  const route = useRoute<ExpenseFormRoute>();
  const { user } = useAuth();
  const expenseId = route.params?.expenseId;
  const isEdit = Boolean(expenseId);

  const [values, setValues] = useState<ExpenseFormValues>(DEFAULT_VALUES);
  const [fieldErrors, setFieldErrors] = useState<ExpenseFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingExpense, setLoadingExpense] = useState(isEdit);

  useEffect(() => {
    if (!expenseId || !user?.uid) {
      setLoadingExpense(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const expense = await getExpense(user.uid, expenseId);
        if (cancelled) return;
        if (!expense) {
          setFormError('Expense not found.');
          setLoadingExpense(false);
          return;
        }
        setValues({
          title: expense.title,
          amountInput: amountMinorToInputString(
            expense.amountMinor,
            expense.currency,
          ),
          category: expense.category,
          spentDate:
            timestampToDate(expense.spentDate) ?? dateAtLocalMidnight(new Date()),
          notes: expense.notes ?? '',
        });
      } catch (err) {
        if (!cancelled) setFormError(getFirestoreErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingExpense(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [expenseId, user?.uid]);

  const handleSave = async () => {
    if (!user?.uid) return;
    const amountMinor = parseMoneyInput(values.amountInput, DEFAULT_CURRENCY);
    if (amountMinor == null) {
      setFieldErrors({ amount: 'Enter a valid amount' });
      return;
    }

    const input = {
      title: values.title,
      amountMinor,
      currency: DEFAULT_CURRENCY,
      category: values.category,
      spentDate: values.spentDate,
      notes: values.notes || null,
    };

    const errors = validateCreateExpenseInput(input);
    setFieldErrors(errors);
    setFormError('');
    if (getFirstFieldError(errors)) return;

    setLoading(true);
    try {
      if (isEdit && expenseId) {
        await updateExpense(user.uid, expenseId, input);
      } else {
        await createExpense(user.uid, input);
      }
      navigation.goBack();
    } catch (err) {
      setFormError(getFirestoreErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!user?.uid || !expenseId) return;
    Alert.alert(
      'Delete expense?',
      'This expense will be removed permanently.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteExpense(user.uid, expenseId);
              navigation.goBack();
            } catch (err) {
              setFormError(getFirestoreErrorMessage(err));
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Pressable
        onPress={() => navigation.goBack()}
        style={[styles.back, { marginTop: insets.top }]}
      >
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>{isEdit ? 'Edit expense' : 'New expense'}</Text>

      {loadingExpense ? (
        <Text style={styles.loading}>Loading expense…</Text>
      ) : (
        <>
          <ExpenseForm
            values={values}
            fieldErrors={fieldErrors}
            onChange={setValues}
          />
          {formError ? <ErrorMessage message={formError} /> : null}
          <Button title="Save" onPress={handleSave} loading={loading} />
          {isEdit ? (
            <Button
              title="Delete expense"
              variant="ghost"
              onPress={handleDelete}
              disabled={loading}
            />
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: spacing.xxl },
  back: { marginBottom: spacing.sm },
  backText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  title: { ...typography.title, marginBottom: spacing.lg },
  loading: { ...typography.body, color: colors.textMuted },
});
