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
  HabitForm,
  type HabitFormValues,
} from '@/features/growth/components/HabitForm';
import type { GrowthStackParamList } from '@/features/growth/navigation/types';
import {
  getFirstHabitFieldError,
  validateCreateHabitInput,
  type HabitFieldErrors,
} from '@/features/growth/utils/validation';
import { archiveHabit, createHabit, getHabit, updateHabit } from '@/firebase/habits';
import { Button, ErrorMessage, Screen } from '@/shared/components';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type HabitFormRoute = RouteProp<GrowthStackParamList, 'HabitForm'>;
type HabitFormNavigation = NativeStackNavigationProp<
  GrowthStackParamList,
  'HabitForm'
>;

const DEFAULT_VALUES: HabitFormValues = {
  title: '',
  description: '',
};

export function HabitFormScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<HabitFormNavigation>();
  const route = useRoute<HabitFormRoute>();
  const { user } = useAuth();
  const habitId = route.params?.habitId;
  const isEdit = Boolean(habitId);

  const [values, setValues] = useState<HabitFormValues>(DEFAULT_VALUES);
  const [fieldErrors, setFieldErrors] = useState<HabitFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHabit, setLoadingHabit] = useState(isEdit);

  useEffect(() => {
    if (!habitId || !user?.uid) {
      setLoadingHabit(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const habit = await getHabit(user.uid, habitId);
        if (cancelled) return;
        if (!habit) {
          setFormError('Habit not found.');
          setLoadingHabit(false);
          return;
        }
        setValues({
          title: habit.title,
          description: habit.description ?? '',
        });
      } catch (err) {
        if (!cancelled) setFormError(getFirestoreErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingHabit(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [habitId, user?.uid]);

  const handleSave = async () => {
    if (!user?.uid) return;

    const input = {
      title: values.title,
      description: values.description || null,
    };

    const errors = validateCreateHabitInput(input);
    setFieldErrors(errors);
    setFormError('');
    if (getFirstHabitFieldError(errors)) return;

    setLoading(true);
    try {
      if (isEdit && habitId) {
        await updateHabit(user.uid, habitId, input);
      } else {
        await createHabit(user.uid, input);
      }
      navigation.goBack();
    } catch (err) {
      setFormError(getFirestoreErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = () => {
    if (!user?.uid || !habitId) return;
    Alert.alert('Archive habit?', 'This habit will be hidden from your lists.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        onPress: async () => {
          setLoading(true);
          try {
            await archiveHabit(user.uid, habitId);
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
      <Text style={styles.title}>{isEdit ? 'Edit habit' : 'New habit'}</Text>

      {loadingHabit ? (
        <Text style={styles.loading}>Loading habit…</Text>
      ) : (
        <>
          <HabitForm
            values={values}
            fieldErrors={fieldErrors}
            onChange={setValues}
          />
          {formError ? <ErrorMessage message={formError} /> : null}
          <Button title="Save" onPress={handleSave} loading={loading} />
          {isEdit ? (
            <Button
              title="Archive habit"
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
  content: {
    paddingBottom: spacing.xxl,
  },
  back: {
    marginBottom: spacing.sm,
  },
  backText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.title,
    marginBottom: spacing.lg,
  },
  loading: {
    ...typography.body,
    color: colors.textMuted,
  },
});
