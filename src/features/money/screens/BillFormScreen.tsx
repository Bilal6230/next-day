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
  BillForm,
  type BillFormValues,
} from '@/features/money/components/BillForm';
import type { MoneyStackParamList } from '@/features/money/navigation/types';
import { DEFAULT_CURRENCY } from '@/features/money/constants';
import {
  getFirstFieldError,
  validateCreateBillInput,
  type BillFieldErrors,
} from '@/features/money/utils/validation';
import { timestampToDate } from '@/features/money/utils/dates';
import { archiveBill, createBill, getBill, updateBill } from '@/firebase/bills';
import { Button, ErrorMessage, Screen } from '@/shared/components';
import {
  amountMinorToInputString,
  parseMoneyInput,
} from '@/shared/utils/money';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type BillFormRoute = RouteProp<MoneyStackParamList, 'BillForm'>;
type BillFormNavigation = NativeStackNavigationProp<
  MoneyStackParamList,
  'BillForm'
>;

const DEFAULT_VALUES: BillFormValues = {
  name: '',
  amountInput: '',
  repeatType: 'none',
  dueDate: null,
  dueDayOfMonth: '1',
};

export function BillFormScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BillFormNavigation>();
  const route = useRoute<BillFormRoute>();
  const { user } = useAuth();
  const billId = route.params?.billId;
  const isEdit = Boolean(billId);

  const [values, setValues] = useState<BillFormValues>(DEFAULT_VALUES);
  const [fieldErrors, setFieldErrors] = useState<BillFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBill, setLoadingBill] = useState(isEdit);

  useEffect(() => {
    if (!billId || !user?.uid) {
      setLoadingBill(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const bill = await getBill(user.uid, billId);
        if (cancelled) return;
        if (!bill) {
          setFormError('Bill not found.');
          setLoadingBill(false);
          return;
        }
        setValues({
          name: bill.name,
          amountInput: amountMinorToInputString(
            bill.amountMinor,
            bill.currency,
          ),
          repeatType: bill.repeatType,
          dueDate: timestampToDate(bill.dueDate),
          dueDayOfMonth: String(bill.dueDayOfMonth ?? 1),
        });
      } catch (err) {
        if (!cancelled) setFormError(getFirestoreErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingBill(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [billId, user?.uid]);

  const buildInput = () => {
    const amountMinor = parseMoneyInput(values.amountInput, DEFAULT_CURRENCY);
    if (amountMinor == null) {
      return null;
    }
    return {
      name: values.name,
      amountMinor,
      currency: DEFAULT_CURRENCY,
      repeatType: values.repeatType,
      dueDate: values.repeatType === 'none' ? values.dueDate : null,
      dueDayOfMonth:
        values.repeatType === 'monthly'
          ? Number(values.dueDayOfMonth)
          : null,
    };
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    const input = buildInput();
    if (!input) {
      setFieldErrors({ amount: 'Enter a valid amount' });
      return;
    }

    const errors = validateCreateBillInput(input);
    setFieldErrors(errors);
    setFormError('');
    if (getFirstFieldError(errors)) return;

    setLoading(true);
    try {
      if (isEdit && billId) {
        await updateBill(user.uid, billId, input);
      } else {
        await createBill(user.uid, input);
      }
      navigation.goBack();
    } catch (err) {
      setFormError(getFirestoreErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = () => {
    if (!user?.uid || !billId) return;
    Alert.alert('Archive bill?', 'This bill will be hidden from due soon lists.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        onPress: async () => {
          setLoading(true);
          try {
            await archiveBill(user.uid, billId);
            navigation.goBack();
          } catch (err) {
            setFormError(getFirestoreErrorMessage(err));
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <Pressable
        onPress={() => navigation.goBack()}
        style={[styles.back, { marginTop: insets.top }]}
      >
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>{isEdit ? 'Edit bill' : 'New bill'}</Text>

      {loadingBill ? (
        <Text style={styles.loading}>Loading bill…</Text>
      ) : (
        <>
          <BillForm
            values={values}
            fieldErrors={fieldErrors}
            onChange={setValues}
          />
          {formError ? <ErrorMessage message={formError} /> : null}
          <Button title="Save" onPress={handleSave} loading={loading} />
          {isEdit ? (
            <Button
              title="Archive bill"
              variant="secondary"
              onPress={handleArchive}
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
