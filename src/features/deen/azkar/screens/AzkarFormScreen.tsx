import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '@/app/providers/AuthProvider';
import { AzkarForm } from '@/features/deen/azkar/components/AzkarForm';
import { getRoutineLabel } from '@/features/deen/azkar/constants';
import type { AzkarFieldErrors, AzkarFormValues } from '@/features/deen/azkar/types';
import {
  getFirstAzkarFieldError,
  parseAzkarTargetCountInput,
  validateCreateAzkarItemInput,
} from '@/features/deen/azkar/utils/validation';
import type { DeenStackParamList } from '@/features/deen/navigation/types';
import {
  archiveAzkarItem,
  createAzkarItem,
  getAzkarItem,
  updateAzkarItem,
} from '@/firebase/azkarItems';
import { Button, ErrorMessage, Screen } from '@/shared/components';
import { useActionLock } from '@/shared/hooks/useActionLock';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type AzkarFormRoute = RouteProp<DeenStackParamList, 'AzkarForm'>;
type AzkarFormNavigation = NativeStackNavigationProp<
  DeenStackParamList,
  'AzkarForm'
>;

const DEFAULT_VALUES: AzkarFormValues = {
  title: '',
  phrase: '',
  transliteration: '',
  translation: '',
  targetCount: '1',
};

export function AzkarFormScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AzkarFormNavigation>();
  const route = useRoute<AzkarFormRoute>();
  const { user } = useAuth();
  const { routine } = route.params;
  const azkarItemId = route.params.azkarItemId;
  const isEdit = Boolean(azkarItemId);

  const [values, setValues] = useState<AzkarFormValues>(DEFAULT_VALUES);
  const [fieldErrors, setFieldErrors] = useState<AzkarFieldErrors>({});
  const [formError, setFormError] = useState('');
  const { busy: loading, runLocked } = useActionLock();
  const [loadingItem, setLoadingItem] = useState(isEdit);

  useEffect(() => {
    if (!azkarItemId || !user?.uid) {
      setLoadingItem(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const item = await getAzkarItem(user.uid, azkarItemId);
        if (cancelled) return;
        if (!item) {
          setFormError('Azkar not found');
          setLoadingItem(false);
          return;
        }
        if (item.status === 'archived') {
          setFormError('Cannot update an archived azkar');
          setLoadingItem(false);
          return;
        }
        if (item.routine !== routine) {
          setFormError('Invalid azkar routine');
          setLoadingItem(false);
          return;
        }
        setValues({
          title: item.title,
          phrase: item.phrase,
          transliteration: item.transliteration ?? '',
          translation: item.translation ?? '',
          targetCount: String(item.targetCount),
        });
      } catch (err) {
        if (!cancelled) setFormError(getFirestoreErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingItem(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [azkarItemId, routine, user?.uid]);

  const buildInput = () => {
    const targetCount = parseAzkarTargetCountInput(values.targetCount);
    return {
      title: values.title,
      phrase: values.phrase,
      transliteration: values.transliteration.trim() || null,
      translation: values.translation.trim() || null,
      routine,
      targetCount: targetCount ?? 0,
    };
  };

  const handleSave = () => {
    if (!user?.uid) return;

    const input = buildInput();
    const errors = validateCreateAzkarItemInput(input);
    setFieldErrors(errors);
    setFormError('');
    if (getFirstAzkarFieldError(errors)) return;

    runLocked(async () => {
      try {
        if (isEdit && azkarItemId) {
          await updateAzkarItem(user.uid, azkarItemId, {
            title: input.title,
            phrase: input.phrase,
            transliteration: input.transliteration,
            translation: input.translation,
            targetCount: input.targetCount,
          });
        } else {
          await createAzkarItem(user.uid, input);
        }
        navigation.goBack();
      } catch (err) {
        setFormError(getFirestoreErrorMessage(err));
      }
    });
  };

  const handleArchive = () => {
    if (!user?.uid || !azkarItemId) return;
    Alert.alert(
      'Archive azkar?',
      'This azkar will be hidden from your active list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: () => {
            runLocked(async () => {
              try {
                await archiveAzkarItem(user.uid, azkarItemId);
                navigation.goBack();
              } catch (err) {
                setFormError(getFirestoreErrorMessage(err));
              }
            });
          },
        },
      ],
    );
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.title}>
          {isEdit
            ? `Edit ${getRoutineLabel(routine).toLowerCase()} azkar`
            : `New ${getRoutineLabel(routine).toLowerCase()} azkar`}
        </Text>
      </View>

      {loadingItem ? (
        <Text style={styles.loading}>Loading azkar…</Text>
      ) : (
        <>
          <AzkarForm
            routine={routine}
            values={values}
            fieldErrors={fieldErrors}
            onChange={setValues}
          />
          {formError ? <ErrorMessage message={formError} /> : null}
          <Button title="Save" onPress={handleSave} loading={loading} />
          {isEdit ? (
            <View style={styles.archiveZone}>
              <Button
                title="Archive azkar"
                variant="secondary"
                onPress={handleArchive}
                disabled={loading}
              />
            </View>
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
  header: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  back: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    ...typography.title,
  },
  loading: {
    ...typography.body,
    color: colors.textMuted,
  },
  archiveZone: {
    marginTop: spacing.lg,
  },
});
