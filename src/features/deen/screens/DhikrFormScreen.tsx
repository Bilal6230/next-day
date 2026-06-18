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
import {
  DhikrForm,
} from '@/features/deen/components/DhikrForm';
import type { DhikrFieldErrors, DhikrFormValues } from '@/features/deen/types';
import type { DeenStackParamList } from '@/features/deen/navigation/types';
import {
  getFirstDhikrFieldError,
  parseDhikrTargetCountInput,
  validateCreateDhikrInput,
} from '@/features/deen/utils/validation';
import {
  archiveDhikr,
  createDhikr,
  getDhikr,
  updateDhikr,
} from '@/firebase/dhikrs';
import { Button, ErrorMessage, Screen } from '@/shared/components';
import { useActionLock } from '@/shared/hooks/useActionLock';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type DhikrFormRoute = RouteProp<DeenStackParamList, 'DhikrForm'>;
type DhikrFormNavigation = NativeStackNavigationProp<
  DeenStackParamList,
  'DhikrForm'
>;

const DEFAULT_VALUES: DhikrFormValues = {
  title: '',
  phrase: '',
  transliteration: '',
  translation: '',
  targetCount: '33',
};

export function DhikrFormScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DhikrFormNavigation>();
  const route = useRoute<DhikrFormRoute>();
  const { user } = useAuth();
  const dhikrId = route.params?.dhikrId;
  const isEdit = Boolean(dhikrId);

  const [values, setValues] = useState<DhikrFormValues>(DEFAULT_VALUES);
  const [fieldErrors, setFieldErrors] = useState<DhikrFieldErrors>({});
  const [formError, setFormError] = useState('');
  const { busy: loading, runLocked } = useActionLock();
  const [loadingDhikr, setLoadingDhikr] = useState(isEdit);

  useEffect(() => {
    if (!dhikrId || !user?.uid) {
      setLoadingDhikr(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const dhikr = await getDhikr(user.uid, dhikrId);
        if (cancelled) return;
        if (!dhikr) {
          setFormError('Dhikr not found');
          setLoadingDhikr(false);
          return;
        }
        if (dhikr.status === 'archived') {
          setFormError('Cannot update an archived dhikr');
          setLoadingDhikr(false);
          return;
        }
        setValues({
          title: dhikr.title,
          phrase: dhikr.phrase,
          transliteration: dhikr.transliteration ?? '',
          translation: dhikr.translation ?? '',
          targetCount: String(dhikr.targetCount),
        });
      } catch (err) {
        if (!cancelled) setFormError(getFirestoreErrorMessage(err));
      } finally {
        if (!cancelled) setLoadingDhikr(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dhikrId, user?.uid]);

  const buildInput = () => {
    const targetCount = parseDhikrTargetCountInput(values.targetCount);
    return {
      title: values.title,
      phrase: values.phrase,
      transliteration: values.transliteration.trim() || null,
      translation: values.translation.trim() || null,
      targetCount: targetCount ?? 0,
    };
  };

  const handleSave = () => {
    if (!user?.uid) return;

    const input = buildInput();
    const errors = validateCreateDhikrInput(input);
    setFieldErrors(errors);
    setFormError('');
    if (getFirstDhikrFieldError(errors)) return;

    runLocked(async () => {
      try {
        if (isEdit && dhikrId) {
          await updateDhikr(user.uid, dhikrId, input);
        } else {
          await createDhikr(user.uid, input);
        }
        navigation.goBack();
      } catch (err) {
        setFormError(getFirestoreErrorMessage(err));
      }
    });
  };

  const handleArchive = () => {
    if (!user?.uid || !dhikrId) return;
    Alert.alert(
      'Archive dhikr?',
      'This dhikr will be hidden from your active list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: () => {
            runLocked(async () => {
              try {
                await archiveDhikr(user.uid, dhikrId);
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
          {isEdit ? 'Edit custom dhikr' : 'New custom dhikr'}
        </Text>
      </View>

      {loadingDhikr ? (
        <Text style={styles.loading}>Loading dhikr…</Text>
      ) : (
        <>
          <DhikrForm
            values={values}
            fieldErrors={fieldErrors}
            onChange={setValues}
          />
          {formError ? <ErrorMessage message={formError} /> : null}
          <Button title="Save" onPress={handleSave} loading={loading} />
          {isEdit ? (
            <View style={styles.archiveZone}>
              <Button
                title="Archive dhikr"
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
