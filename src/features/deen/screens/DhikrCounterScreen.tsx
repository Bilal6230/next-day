import { useMemo } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '@/app/providers/AuthProvider';
import { getPredefinedDhikr } from '@/features/deen/constants';
import { DhikrCounter } from '@/features/deen/components/DhikrCounter';
import { useCustomDhikrs } from '@/features/deen/hooks/useCustomDhikrs';
import { useDhikrCounter } from '@/features/deen/hooks/useDhikrCounter';
import { useTodayDhikrProgress } from '@/features/deen/hooks/useTodayDhikrProgress';
import type { DeenStackParamList } from '@/features/deen/navigation/types';
import { isDhikrCompleted } from '@/features/deen/utils/progress';
import { ErrorMessage, Screen } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type DhikrCounterRoute = RouteProp<DeenStackParamList, 'DhikrCounter'>;
type DhikrCounterNavigation = NativeStackNavigationProp<
  DeenStackParamList,
  'DhikrCounter'
>;

export function DhikrCounterScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DhikrCounterNavigation>();
  const route = useRoute<DhikrCounterRoute>();
  const { user } = useAuth();
  const { dhikrId, sourceType } = route.params;

  const { dhikrs: customDhikrs } = useCustomDhikrs(user?.uid);
  const { dateKey } = useTodayDhikrProgress(user?.uid);

  const definition = useMemo(() => {
    if (sourceType === 'default') {
      const predefined = getPredefinedDhikr(dhikrId);
      if (!predefined) return null;
      return {
        title: predefined.title,
        phrase: predefined.phrase,
        transliteration: predefined.transliteration,
        translation: predefined.translation,
        targetCount: predefined.targetCount,
      };
    }

    const custom = customDhikrs.find((item) => item.id === dhikrId);
    if (!custom || custom.status === 'archived') return null;
    return {
      title: custom.title,
      phrase: custom.phrase,
      transliteration: custom.transliteration,
      translation: custom.translation,
      targetCount: custom.targetCount,
    };
  }, [customDhikrs, dhikrId, sourceType]);

  const {
    localCount,
    targetCount,
    progressPercent,
    loading,
    loadError,
    persistError,
    resetting,
    increment,
    decrement,
    resetToday,
  } = useDhikrCounter({
    uid: user?.uid,
    dateKey,
    dhikrId,
    sourceType,
    definition: definition ?? {
      title: '',
      phrase: '',
      transliteration: null,
      translation: null,
      targetCount: 1,
    },
  });

  const completed = isDhikrCompleted(localCount, targetCount);

  const handleResetToday = () => {
    Alert.alert(
      'Reset today?',
      'This clears today’s count for this dhikr.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetToday },
      ],
    );
  };

  if (!definition && !loading) {
    return (
      <Screen contentStyle={styles.content}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.back, { marginTop: insets.top }]}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <ErrorMessage message="Dhikr not found" />
      </Screen>
    );
  }

  return (
    <Screen scroll contentStyle={styles.content}>
      <Pressable
        onPress={() => navigation.goBack()}
        style={[styles.back, { marginTop: insets.top }]}
      >
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <>
          <DhikrCounter
            title={definition?.title ?? ''}
            phrase={definition?.phrase ?? ''}
            transliteration={definition?.transliteration ?? null}
            translation={definition?.translation ?? null}
            count={localCount}
            targetCount={targetCount}
            progressPercent={progressPercent}
            completed={completed}
            onIncrement={increment}
            onDecrement={decrement}
            onResetToday={handleResetToday}
            resetting={resetting}
          />
          {loadError ? <ErrorMessage message={loadError} /> : null}
          {persistError ? <ErrorMessage message={persistError} /> : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xxl,
  },
  back: {
    marginBottom: spacing.md,
  },
  backText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  loader: {
    marginTop: spacing.xl,
  },
});
