import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Expense } from '@/features/money/types';
import { formatSpentDateLabel } from '@/features/money/utils/dates';
import { Card } from '@/shared/components';
import { formatMoney } from '@/shared/utils/money';
import { colors, spacing, typography } from '@/shared/theme';

type ExpenseListItemProps = {
  expense: Expense;
  onPress: () => void;
};

export function ExpenseListItem({ expense, onPress }: ExpenseListItemProps) {
  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {expense.title}
          </Text>
          <Text style={styles.meta}>
            {expense.category} · {formatSpentDateLabel(expense.spentDateKey)}
          </Text>
        </View>
        <Text style={styles.amount}>
          {formatMoney(expense.amountMinor, expense.currency)}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
  },
  meta: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  amount: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
