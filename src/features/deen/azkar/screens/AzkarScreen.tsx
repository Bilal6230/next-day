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
import { AzkarListItem } from '@/features/deen/azkar/components/AzkarListItem';
import { AzkarSummaryCard } from '@/features/deen/azkar/components/AzkarSummaryCard';
import { useAzkarDashboard } from '@/features/deen/azkar/hooks/useAzkarDashboard';
import type { AzkarDashboardRow } from '@/features/deen/azkar/types';
import type { DeenStackParamList } from '@/features/deen/navigation/types';
import { setAzkarProgressDone } from '@/firebase/azkarProgress';
import {
  Button,
  ErrorMessage,
  SectionHeader,
} from '@/shared/components';
import { useActionLock } from '@/shared/hooks/useActionLock';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type AzkarNavigation = NativeStackNavigationProp<DeenStackParamList, 'AzkarHome'>;

export function AzkarScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AzkarNavigation>();
  const { user } = useAuth();
  const [actionError, setActionError] = useState('');
  const { runLocked } = useActionLock();

  const {
    morningRows,
    eveningRows,
    morningSummary,
    eveningSummary,
    dateKey,
    isLoading,
    error,
    retry,
  } = useAzkarDashboard(user?.uid);

  const handleToggleDone = (row: AzkarDashboardRow) => {
    if (!user?.uid) return;

    runLocked(async () => {
      setActionError('');
      try {
        await setAzkarProgressDone(user.uid, dateKey, {
          azkarItemId: row.id,
          sourceType: row.sourceType,
          routine: row.routine,
          titleSnapshot: row.title,
          phraseSnapshot: row.phrase,
          targetCountSnapshot: row.targetCount,
          completed: !row.completed,
        });
      } catch (err) {
        setActionError(getFirestoreErrorMessage(err));
      }
    });
  };

  const openCreateForm = (routine: 'morning' | 'evening') => {
    navigation.navigate('AzkarForm', { routine });
  };

  const openEditForm = (azkarItemId: string, routine: 'morning' | 'evening') => {
    navigation.navigate('AzkarForm', { azkarItemId, routine });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>
          Back
        </Text>
        <Text style={styles.title}>Morning & Evening Azkar</Text>
        <Text style={styles.subtitle}>
          Complete your daily azkar checklist.
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
          <AzkarSummaryCard
            morningSummary={morningSummary}
            eveningSummary={eveningSummary}
          />

          {actionError ? <ErrorMessage message={actionError} /> : null}

          <SectionHeader
            title="Morning Azkar"
            actionLabel="Add"
            onAction={() => openCreateForm('morning')}
          />
          {morningRows.map((row) => (
            <AzkarListItem
              key={row.id}
              row={row}
              onToggleDone={() => handleToggleDone(row)}
              onEdit={
                row.canEdit
                  ? () => openEditForm(row.id, row.routine)
                  : undefined
              }
            />
          ))}

          <SectionHeader
            title="Evening Azkar"
            actionLabel="Add"
            onAction={() => openCreateForm('evening')}
          />
          {eveningRows.map((row) => (
            <AzkarListItem
              key={row.id}
              row={row}
              onToggleDone={() => handleToggleDone(row)}
              onEdit={
                row.canEdit
                  ? () => openEditForm(row.id, row.routine)
                  : undefined
              }
            />
          ))}
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
});
