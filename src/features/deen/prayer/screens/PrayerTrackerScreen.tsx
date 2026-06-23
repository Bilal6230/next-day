import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '@/app/providers/AuthProvider';
import { PRAYER_KEYS } from '@/features/deen/prayer/constants';
import { PrayerListItem } from '@/features/deen/prayer/components/PrayerListItem';
import { PrayerStatusModal } from '@/features/deen/prayer/components/PrayerStatusModal';
import { PrayerSummaryCard } from '@/features/deen/prayer/components/PrayerSummaryCard';
import { useTodayPrayerLog } from '@/features/deen/prayer/hooks/useTodayPrayerLog';
import type { PrayerKey, PrayerStatus } from '@/features/deen/prayer/types';
import type { DeenStackParamList } from '@/features/deen/navigation/types';
import { setPrayerStatus } from '@/firebase/prayerLogs';
import { Button, ErrorMessage } from '@/shared/components';
import { useActionLock } from '@/shared/hooks/useActionLock';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type PrayerTrackerNavigation = NativeStackNavigationProp<
  DeenStackParamList,
  'PrayerTracker'
>;

export function PrayerTrackerScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<PrayerTrackerNavigation>();
  const { user } = useAuth();
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerKey | null>(null);
  const [actionError, setActionError] = useState('');
  const { busy: updating, runLocked } = useActionLock();

  const { log, summary, dateKey, isLoading, error, retry } = useTodayPrayerLog(
    user?.uid,
  );

  const handleSelectStatus = (status: PrayerStatus) => {
    if (!user?.uid || !selectedPrayer) return;

    runLocked(async () => {
      setActionError('');
      try {
        await setPrayerStatus(user.uid, dateKey, selectedPrayer, status);
      } catch (err) {
        setActionError(getFirestoreErrorMessage(err));
      }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>
          Back
        </Text>
        <Text style={styles.title}>Prayer Tracker</Text>
        <Text style={styles.subtitle}>
          Track today’s five daily prayers.
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
          <PrayerSummaryCard summary={summary} />

          {actionError ? <ErrorMessage message={actionError} /> : null}

          {PRAYER_KEYS.map((prayerKey) => (
            <PrayerListItem
              key={prayerKey}
              prayerKey={prayerKey}
              status={log.prayers[prayerKey]}
              onPress={() => setSelectedPrayer(prayerKey)}
            />
          ))}
        </ScrollView>
      )}

      <PrayerStatusModal
        visible={selectedPrayer != null}
        prayerKey={selectedPrayer}
        onClose={() => setSelectedPrayer(null)}
        onSelectStatus={handleSelectStatus}
        disabled={updating}
      />
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
});
