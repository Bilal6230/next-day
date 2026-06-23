import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useNavigation,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '@/app/providers/AuthProvider';
import { useAzkarDashboard } from '@/features/deen/azkar/hooks/useAzkarDashboard';
import { useTodayPrayerLog } from '@/features/deen/prayer/hooks/useTodayPrayerLog';
import { DhikrListItem } from '@/features/deen/components/DhikrListItem';
import { DhikrSummaryCard } from '@/features/deen/components/DhikrSummaryCard';
import { useDhikrDashboard } from '@/features/deen/hooks/useDhikrDashboard';
import type { DeenStackParamList } from '@/features/deen/navigation/types';
import {
  Button,
  Card,
  EmptyState,
  ErrorMessage,
  SectionHeader,
} from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type DeenNavigation = NativeStackNavigationProp<DeenStackParamList, 'DeenHome'>;

export function DeenScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DeenNavigation>();
  const { user } = useAuth();

  const {
    commonRows,
    customRows,
    summary,
    isLoading,
    error,
    retry,
  } = useDhikrDashboard(user?.uid);

  const {
    morningSummary,
    eveningSummary,
    isLoading: azkarLoading,
    error: azkarError,
  } = useAzkarDashboard(user?.uid);

  const {
    summary: prayerSummary,
    isLoading: prayerLoading,
    error: prayerError,
  } = useTodayPrayerLog(user?.uid);

  const openCounter = (dhikrId: string, sourceType: 'default' | 'custom') => {
    navigation.navigate('DhikrCounter', { dhikrId, sourceType });
  };

  const openCreateForm = () => {
    navigation.navigate('DhikrForm', {});
  };

  const openEditForm = (dhikrId: string) => {
    navigation.navigate('DhikrForm', { dhikrId });
  };

  const openAzkar = () => {
    navigation.navigate('AzkarHome');
  };

  const openPrayerTracker = () => {
    navigation.navigate('PrayerTracker');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>
          Back
        </Text>
        <Text style={styles.title}>Deen</Text>
        <Text style={styles.subtitle}>
          Daily dhikr, custom zikrs, and spiritual progress.
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : error ? (
        <View style={styles.errorBlock}>
          <ErrorMessage message={error} />
          <Button title="Retry" onPress={retry} variant="secondary" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.azkarCard}>
            <Text style={styles.azkarTitle}>Morning & Evening Azkar</Text>
            <Text style={styles.azkarSubtitle}>
              Complete your daily azkar checklist.
            </Text>
            {!azkarLoading && !azkarError ? (
              <Text style={styles.azkarProgress}>
                Morning {morningSummary.completedCount}/{morningSummary.totalCount}
                {' · '}
                Evening {eveningSummary.completedCount}/{eveningSummary.totalCount}
              </Text>
            ) : null}
            <Button
              title="Open Azkar"
              variant="secondary"
              onPress={openAzkar}
              style={styles.azkarButton}
            />
          </Card>

          <Card style={styles.prayerCard}>
            <Text style={styles.prayerTitle}>Prayer Tracker</Text>
            <Text style={styles.prayerSubtitle}>
              Track today’s five daily prayers.
            </Text>
            {!prayerLoading && !prayerError ? (
              <Text style={styles.prayerProgress}>
                Completed {prayerSummary.completedCount}/{prayerSummary.totalCount}
                {' · '}
                Missed {prayerSummary.missedCount}
              </Text>
            ) : null}
            <Button
              title="Open Prayer Tracker"
              variant="secondary"
              onPress={openPrayerTracker}
              style={styles.prayerButton}
            />
          </Card>

          <DhikrSummaryCard
            completedCount={summary.completedCount}
            totalCount={summary.totalCount}
          />

          <SectionHeader title="Common Dhikrs" />
          {commonRows.map((row) => (
            <DhikrListItem
              key={row.id}
              row={row}
              onPress={() => openCounter(row.id, row.sourceType)}
            />
          ))}

          <SectionHeader
            title="My Dhikrs"
            actionLabel="Add"
            onAction={openCreateForm}
          />
          {customRows.length === 0 ? (
            <View style={styles.emptyBlock}>
              <EmptyState
                title="No custom dhikrs yet"
                description="Create your own dhikr to track alongside the common set."
              />
              <Button title="Add custom dhikr" onPress={openCreateForm} />
            </View>
          ) : (
            customRows.map((row) => (
              <DhikrListItem
                key={row.id}
                row={row}
                onPress={() => openCounter(row.id, row.sourceType)}
                onEdit={() => openEditForm(row.id)}
              />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  back: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  loader: {
    marginTop: spacing.xl,
  },
  errorBlock: {
    gap: spacing.md,
  },
  scroll: {
    paddingBottom: spacing.xxl,
  },
  emptyBlock: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  azkarCard: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  azkarTitle: {
    ...typography.heading,
  },
  azkarSubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  azkarProgress: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  azkarButton: {
    marginTop: spacing.sm,
  },
  prayerCard: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  prayerTitle: {
    ...typography.heading,
  },
  prayerSubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  prayerProgress: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  prayerButton: {
    marginTop: spacing.sm,
  },
});
