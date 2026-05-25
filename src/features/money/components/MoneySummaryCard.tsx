import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useMonthlySpending } from '@/features/money/hooks/useMonthlySpending';
import { Card, ErrorMessage } from '@/shared/components';
import { formatMoney } from '@/shared/utils/money';
import { colors, spacing, typography } from '@/shared/theme';

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function MoneySummaryCard() {
  const { totalMinor, monthKey, isLoading, error } = useMonthlySpending();

  return (
    <Card style={styles.card}>
      <Text style={styles.label}>Monthly spending</Text>
      <Text style={styles.period}>{formatMonthLabel(monthKey)}</Text>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <Text style={styles.amount}>{formatMoney(totalMinor)}</Text>
      )}
      <Text style={styles.hint}>PKR expenses this month</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  period: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  amount: {
    ...typography.title,
    color: colors.primary,
  },
  loader: {
    marginVertical: spacing.sm,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
