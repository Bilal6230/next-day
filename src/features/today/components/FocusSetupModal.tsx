import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import type { MainTabParamList } from '@/app/navigation/types';
import { SOURCE_TYPE_LABELS } from '@/features/today/focus/constants';
import { useFocusGoalOptions } from '@/features/today/focus/hooks/useFocusGoalOptions';
import { useFocusTaskOptions } from '@/features/today/focus/hooks/useFocusTaskOptions';
import type { DailyFocusSourceType, SetDailyFocusInput } from '@/features/today/focus/types';
import {
  getFirstDailyFocusFieldError,
  validateSetDailyFocusInput,
  type DailyFocusFieldErrors,
} from '@/features/today/focus/utils/validation';
import { Button, EmptyState, ErrorMessage, Input } from '@/shared/components';
import { useActionLock } from '@/shared/hooks/useActionLock';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, radius, spacing, typography } from '@/shared/theme';

type FocusStep = 'pick' | DailyFocusSourceType;

type FocusSetupModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (input: SetDailyFocusInput) => Promise<void>;
  actionsDisabled?: boolean;
};

export function FocusSetupModal({
  visible,
  onClose,
  onSave,
  actionsDisabled = false,
}: FocusSetupModalProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [step, setStep] = useState<FocusStep>('pick');
  const [customTitle, setCustomTitle] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [fieldErrors, setFieldErrors] = useState<DailyFocusFieldErrors>({});
  const [formError, setFormError] = useState('');
  const { busy: saving, runLocked } = useActionLock();

  const tasksEnabled = visible && step === 'task';
  const goalsEnabled = visible && step === 'goal';
  const {
    tasks,
    isLoading: tasksLoading,
    error: tasksError,
    retry: retryTasks,
  } = useFocusTaskOptions(tasksEnabled);
  const {
    goals,
    isLoading: goalsLoading,
    error: goalsError,
    retry: retryGoals,
  } = useFocusGoalOptions(goalsEnabled);

  const resetAndClose = () => {
    setStep('pick');
    setCustomTitle('');
    setCustomNote('');
    setFieldErrors({});
    setFormError('');
    onClose();
  };

  const handleBack = () => {
    setFieldErrors({});
    setFormError('');
    setStep('pick');
  };

  const handleSave = (input: SetDailyFocusInput) => {
    if (actionsDisabled || saving) return;

    const errors = validateSetDailyFocusInput(input);
    setFieldErrors(errors);
    setFormError('');
    if (getFirstDailyFocusFieldError(errors)) return;

    runLocked(async () => {
      try {
        await onSave(input);
        resetAndClose();
      } catch (err) {
        setFormError(getFirestoreErrorMessage(err));
      }
    });
  };

  const handleCustomSave = () => {
    handleSave({
      sourceType: 'custom',
      sourceId: null,
      title: customTitle,
      note: customNote || null,
    });
  };

  const handleTaskSelect = (taskId: string, title: string) => {
    handleSave({
      sourceType: 'task',
      sourceId: taskId,
      title,
      note: null,
    });
  };

  const handleGoalSelect = (goalId: string, title: string) => {
    handleSave({
      sourceType: 'goal',
      sourceId: goalId,
      title,
      note: null,
    });
  };

  const openTasks = () => {
    resetAndClose();
    navigation.navigate('Tasks', { screen: 'TaskForm', params: {} });
  };

  const openGrowth = () => {
    resetAndClose();
    navigation.navigate('Growth', { screen: 'GoalForm', params: {} });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={resetAndClose}
    >
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.header}>
          {step !== 'pick' ? (
            <Pressable onPress={handleBack} hitSlop={8}>
              <Text style={styles.back}>Back</Text>
            </Pressable>
          ) : (
            <View style={styles.backPlaceholder} />
          )}
          <Text style={styles.headerTitle}>Set today&apos;s focus</Text>
          <Pressable onPress={resetAndClose} hitSlop={8}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
          {formError ? <ErrorMessage message={formError} /> : null}

          {step === 'pick' ? (
            <View style={styles.pickList}>
              {(['custom', 'task', 'goal'] as const).map((type) => (
                <Pressable
                  key={type}
                  style={styles.pickRow}
                  onPress={() => setStep(type)}
                >
                  <Text style={styles.pickLabel}>{SOURCE_TYPE_LABELS[type]}</Text>
                  <Text style={styles.pickHint}>
                    {type === 'custom'
                      ? 'Write your own priority'
                      : type === 'task'
                        ? 'Choose a pending task'
                        : 'Choose an active goal'}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {step === 'custom' ? (
            <View style={styles.form}>
              <Input
                label="Title"
                value={customTitle}
                onChangeText={setCustomTitle}
                error={fieldErrors.title}
                placeholder="What matters most today?"
              />
              <Input
                label="Note"
                value={customNote}
                onChangeText={setCustomNote}
                error={fieldErrors.note}
                placeholder="Optional"
                multiline
                numberOfLines={4}
                style={styles.noteInput}
              />
              <Button
                title="Save focus"
                onPress={handleCustomSave}
                loading={saving}
                disabled={actionsDisabled}
              />
            </View>
          ) : null}

          {step === 'task' ? (
            <View style={styles.listBlock}>
              {tasksError ? (
                <View style={styles.listState}>
                  <ErrorMessage message={tasksError} />
                  <Pressable onPress={retryTasks} hitSlop={8}>
                    <Text style={styles.link}>Retry</Text>
                  </Pressable>
                </View>
              ) : tasksLoading ? (
                <View style={styles.listState}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={styles.loadingText}>Loading tasks…</Text>
                </View>
              ) : tasks.length === 0 ? (
                <View style={styles.listState}>
                  <EmptyState
                    title="No pending tasks"
                    description="Add a task to focus on today."
                  />
                  <Pressable onPress={openTasks} hitSlop={8}>
                    <Text style={styles.link}>Add task</Text>
                  </Pressable>
                </View>
              ) : (
                tasks.map((task) => (
                  <Pressable
                    key={task.id}
                    style={styles.optionRow}
                    onPress={() => handleTaskSelect(task.id, task.title)}
                    disabled={saving || actionsDisabled}
                  >
                    <Text style={styles.optionTitle} numberOfLines={2}>
                      {task.title}
                    </Text>
                  </Pressable>
                ))
              )}
              {saving ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={styles.savingIndicator}
                />
              ) : null}
            </View>
          ) : null}

          {step === 'goal' ? (
            <View style={styles.listBlock}>
              {goalsError ? (
                <View style={styles.listState}>
                  <ErrorMessage message={goalsError} />
                  <Pressable onPress={retryGoals} hitSlop={8}>
                    <Text style={styles.link}>Retry</Text>
                  </Pressable>
                </View>
              ) : goalsLoading ? (
                <View style={styles.listState}>
                  <ActivityIndicator color={colors.primary} />
                  <Text style={styles.loadingText}>Loading goals…</Text>
                </View>
              ) : goals.length === 0 ? (
                <View style={styles.listState}>
                  <EmptyState
                    title="No active goals"
                    description="Add a goal in Growth to focus on."
                  />
                  <Pressable onPress={openGrowth} hitSlop={8}>
                    <Text style={styles.link}>Open Growth</Text>
                  </Pressable>
                </View>
              ) : (
                goals.map((goal) => (
                  <Pressable
                    key={goal.id}
                    style={styles.optionRow}
                    onPress={() => handleGoalSelect(goal.id, goal.title)}
                    disabled={saving || actionsDisabled}
                  >
                    <Text style={styles.optionTitle} numberOfLines={2}>
                      {goal.title}
                    </Text>
                  </Pressable>
                ))
              )}
              {saving ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={styles.savingIndicator}
                />
              ) : null}
            </View>
          ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  back: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    minWidth: 48,
  },
  backPlaceholder: {
    minWidth: 48,
  },
  headerTitle: {
    ...typography.heading,
    flex: 1,
    textAlign: 'center',
  },
  cancel: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    minWidth: 48,
    textAlign: 'right',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  pickList: {
    gap: spacing.sm,
  },
  pickRow: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  pickLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  pickHint: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  form: {
    gap: spacing.md,
  },
  noteInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  listBlock: {
    gap: spacing.sm,
  },
  listState: {
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  optionRow: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionTitle: {
    ...typography.body,
    fontWeight: '500',
  },
  link: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  savingIndicator: {
    marginTop: spacing.sm,
  },
});
