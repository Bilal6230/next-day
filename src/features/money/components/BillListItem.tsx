import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Bill } from '@/features/money/types';
import {
  formatBillDueLabel,
  isBillPaidForCurrentPeriod,
} from '@/features/money/utils/billsDue';
import { Card } from '@/shared/components';
import { formatMoney } from '@/shared/utils/money';
import { colors, spacing, typography } from '@/shared/theme';

type BillListItemProps = {
  bill: Bill;
  onPress: () => void;
  onTogglePaid: () => void;
  onArchive: () => void;
};

export function BillListItem({
  bill,
  onPress,
  onTogglePaid,
  onArchive,
}: BillListItemProps) {
  const paid = isBillPaidForCurrentPeriod(bill);

  const handleArchive = () => {
    Alert.alert('Archive bill?', 'You can manage archived bills later.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Archive', onPress: onArchive },
    ]);
  };

  return (
    <Card style={styles.card}>
      <Pressable onPress={onPress} style={styles.main}>
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>
            {bill.name}
          </Text>
          <Text style={styles.meta}>
            {formatMoney(bill.amountMinor, bill.currency)} ·{' '}
            {formatBillDueLabel(bill)}
          </Text>
          <Text style={styles.repeat}>
            {bill.repeatType === 'monthly' ? 'Monthly' : 'One-time'}
          </Text>
        </View>
        <Pressable
          onPress={onTogglePaid}
          style={[styles.paidChip, paid && styles.paidChipActive]}
          hitSlop={8}
        >
          <Text style={[styles.paidLabel, paid && styles.paidLabelActive]}>
            {paid ? 'Paid' : 'Unpaid'}
          </Text>
        </Pressable>
      </Pressable>
      {bill.status === 'active' ? (
        <Pressable onPress={handleArchive} style={styles.archive}>
          <Text style={styles.archiveText}>Archive</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.body,
    fontWeight: '600',
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  repeat: {
    ...typography.caption,
    color: colors.textMuted,
  },
  paidChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paidChipActive: {
    borderColor: colors.success,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
  },
  paidLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  paidLabelActive: {
    color: colors.success,
  },
  archive: {
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  archiveText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
