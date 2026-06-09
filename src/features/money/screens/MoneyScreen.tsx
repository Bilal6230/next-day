import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CompositeNavigationProp,
  useNavigation,
} from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { MainTabParamList } from '@/app/navigation/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { BillListItem } from '@/features/money/components/BillListItem';
import { ExpenseListItem } from '@/features/money/components/ExpenseListItem';
import { MoneySummaryCard } from '@/features/money/components/MoneySummaryCard';
import { RECENT_EXPENSES_LIMIT } from '@/features/money/constants';
import { useBills } from '@/features/money/hooks/useBills';
import { useExpenses } from '@/features/money/hooks/useExpenses';
import type { MoneyStackParamList } from '@/features/money/navigation/types';
import {
  filterBillsDueSoon,
  isBillPaidForCurrentPeriod,
} from '@/features/money/utils/billsDue';
import {
  archiveBill,
  markBillPaid,
  markBillUnpaid,
} from '@/firebase/bills';
import { Button, EmptyState, ErrorMessage, SectionHeader } from '@/shared/components';
import { useActionLock } from '@/shared/hooks/useActionLock';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type MoneyNavigation = CompositeNavigationProp<
  NativeStackNavigationProp<MoneyStackParamList, 'MoneyHome'>,
  BottomTabNavigationProp<MainTabParamList>
>;

export function MoneyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MoneyNavigation>();
  const { user } = useAuth();
  const { bills, isLoading: billsLoading, error: billsError, retry: retryBills } =
    useBills();
  const {
    expenses,
    isLoading: expensesLoading,
    error: expensesError,
    retry: retryExpenses,
  } = useExpenses();
  const [actionError, setActionError] = useState('');
  const { runLocked } = useActionLock();

  const billsDueSoon = useMemo(() => filterBillsDueSoon(bills), [bills]);
  const recentExpenses = expenses.slice(0, RECENT_EXPENSES_LIMIT);

  const handleTogglePaid = (billId: string, paid: boolean) => {
    if (!user?.uid) return;
    runLocked(async () => {
      setActionError('');
      try {
        if (paid) {
          await markBillUnpaid(user.uid, billId);
        } else {
          await markBillPaid(user.uid, billId);
        }
      } catch (err) {
        setActionError(getFirestoreErrorMessage(err));
      }
    });
  };

  const handleArchive = (billId: string) => {
    if (!user?.uid) return;
    runLocked(async () => {
      setActionError('');
      try {
        await archiveBill(user.uid, billId);
      } catch (err) {
        setActionError(getFirestoreErrorMessage(err));
      }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <Text style={styles.title}>Money</Text>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <MoneySummaryCard />

        {actionError ? <ErrorMessage message={actionError} /> : null}

        <SectionHeader
          title="Bills due soon"
          actionLabel="Add bill"
          onAction={() => navigation.navigate('BillForm', {})}
        />
        {billsLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : billsError ? (
          <View style={styles.block}>
            <ErrorMessage message={billsError} />
            <Button title="Retry" onPress={retryBills} variant="secondary" />
          </View>
        ) : billsDueSoon.length === 0 ? (
          <EmptyState
            title="No bills due soon"
            description="Nothing due in the next 7 days."
          />
        ) : (
          billsDueSoon.map((bill) => (
            <BillListItem
              key={bill.id}
              bill={bill}
              onPress={() =>
                navigation.navigate('BillForm', { billId: bill.id })
              }
              onTogglePaid={() =>
                handleTogglePaid(bill.id, isBillPaidForCurrentPeriod(bill))
              }
              onArchive={() => handleArchive(bill.id)}
            />
          ))
        )}

        <SectionHeader
          title="Recent expenses"
          actionLabel="Add expense"
          onAction={() => navigation.navigate('ExpenseForm', {})}
        />
        {expensesLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : expensesError ? (
          <View style={styles.block}>
            <ErrorMessage message={expensesError} />
            <Button title="Retry" onPress={retryExpenses} variant="secondary" />
          </View>
        ) : recentExpenses.length === 0 ? (
          <EmptyState
            title="No expenses yet"
            description="Track spending to see your monthly summary."
          />
        ) : (
          recentExpenses.map((expense) => (
            <ExpenseListItem
              key={expense.id}
              expense={expense}
              onPress={() =>
                navigation.navigate('ExpenseForm', { expenseId: expense.id })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.title,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
  },
  loader: {
    marginVertical: spacing.md,
  },
  block: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
});
