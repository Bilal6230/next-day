import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import type { MainTabParamList } from '@/app/navigation/types';
import { TODAY_BILLS_LIMIT } from '@/features/money/constants';
import { useBillsDueSoon } from '@/features/money/hooks/useBillsDueSoon';
import { formatBillDueLabel } from '@/features/money/utils/billsDue';
import { Card, EmptyState, ErrorMessage } from '@/shared/components';
import { formatMoney } from '@/shared/utils/money';
import { colors, spacing, typography } from '@/shared/theme';

const ACCENT = '#FBBF24';

export function BillsDueSoonCard() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { bills, isLoading, error, retry } = useBillsDueSoon();
  const preview = bills.slice(0, TODAY_BILLS_LIMIT);

  const openMoney = () => {
    navigation.navigate('Money', { screen: 'MoneyHome' });
  };

  const openAddBill = () => {
    navigation.navigate('Money', { screen: 'BillForm', params: {} });
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.accent, { backgroundColor: ACCENT }]} />
        <Text style={styles.title}>Bills Due Soon</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} size="small" />
          <Text style={styles.loadingText}>Loading bills…</Text>
        </View>
      ) : error ? (
        <View style={styles.block}>
          <ErrorMessage message={error} />
          <View style={styles.actions}>
            <Pressable onPress={retry} hitSlop={8}>
              <Text style={styles.action}>Retry</Text>
            </Pressable>
            <Pressable onPress={openMoney} hitSlop={8}>
              <Text style={styles.action}>Open Money</Text>
            </Pressable>
          </View>
        </View>
      ) : preview.length === 0 ? (
        <View style={styles.block}>
          <EmptyState
            title="No upcoming bills"
            description="Nothing due in the next 7 days."
          />
          <View style={styles.actions}>
            <Pressable onPress={openAddBill} hitSlop={8}>
              <Text style={styles.action}>Add bill</Text>
            </Pressable>
            <Pressable onPress={openMoney} hitSlop={8}>
              <Text style={styles.action}>Open Money</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.list}>
          {preview.map((bill) => (
            <View key={bill.id} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.billName} numberOfLines={1}>
                  {bill.name}
                </Text>
                <Text style={styles.meta}>
                  {formatMoney(bill.amountMinor, bill.currency)} ·{' '}
                  {formatBillDueLabel(bill)}
                </Text>
              </View>
            </View>
          ))}
          <View style={styles.actions}>
            <Pressable onPress={openMoney} hitSlop={8}>
              <Text style={styles.action}>View all</Text>
            </Pressable>
            <Pressable onPress={openAddBill} hitSlop={8}>
              <Text style={styles.action}>Add bill</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  accent: { width: 4, height: 20, borderRadius: 2 },
  title: { ...typography.heading },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  loadingText: { ...typography.bodySmall, color: colors.textMuted },
  block: { gap: spacing.sm },
  list: { gap: spacing.md },
  row: { gap: 2 },
  rowText: { flex: 1 },
  billName: { ...typography.body, fontWeight: '500' },
  meta: { ...typography.caption, color: colors.textSecondary },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  action: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
});
