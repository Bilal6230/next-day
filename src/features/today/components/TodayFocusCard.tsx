import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import type { MainTabParamList } from '@/app/navigation/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { FocusSetupModal } from '@/features/today/components/FocusSetupModal';
import {
  FOCUS_NOTE_PREVIEW_LENGTH,
  SOURCE_TYPE_LABELS,
} from '@/features/today/focus/constants';
import { useTodayFocus } from '@/features/today/focus/hooks/useTodayFocus';
import { getGoal } from '@/firebase/goals';
import { getTask } from '@/firebase/tasks';
import { Card, Button, EmptyState, ErrorMessage } from '@/shared/components';
import { useActionLock } from '@/shared/hooks/useActionLock';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

const ACCENT = colors.primary;

function truncateNote(note: string): string {
  const trimmed = note.trim();
  if (!trimmed) return '';
  if (trimmed.length <= FOCUS_NOTE_PREVIEW_LENGTH) return trimmed;
  return `${trimmed.slice(0, FOCUS_NOTE_PREVIEW_LENGTH)}…`;
}

export function TodayFocusCard() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { user } = useAuth();
  const {
    focus,
    isLoading,
    error,
    retry,
    setFocus,
    completeFocus,
    undoCompleteFocus,
    clearFocus,
  } = useTodayFocus();

  const [modalVisible, setModalVisible] = useState(false);
  const [actionError, setActionError] = useState('');
  const { busy: actionLoading, runLocked } = useActionLock();
  const [linkedAvailable, setLinkedAvailable] = useState(false);

  useEffect(() => {
    if (!user?.uid || !focus?.sourceId) {
      setLinkedAvailable(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        if (focus.sourceType === 'task') {
          const task = await getTask(user.uid, focus.sourceId!);
          if (!cancelled) setLinkedAvailable(task != null && task.status === 'pending');
        } else if (focus.sourceType === 'goal') {
          const goal = await getGoal(user.uid, focus.sourceId!);
          if (!cancelled) setLinkedAvailable(goal != null && goal.status === 'active');
        } else {
          if (!cancelled) setLinkedAvailable(false);
        }
      } catch {
        if (!cancelled) setLinkedAvailable(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, focus?.sourceId, focus?.sourceType]);

  const handleToggleComplete = () => {
    runLocked(async () => {
      setActionError('');
      try {
        if (focus?.completed) {
          await undoCompleteFocus();
        } else {
          await completeFocus();
        }
      } catch (err) {
        setActionError(getFirestoreErrorMessage(err));
      }
    });
  };

  const handleClear = () => {
    Alert.alert(
      'Clear today\'s focus?',
      'This removes your focus for today.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            runLocked(async () => {
              setActionError('');
              try {
                await clearFocus();
              } catch (err) {
                setActionError(getFirestoreErrorMessage(err));
              }
            });
          },
        },
      ],
    );
  };

  const openLinked = () => {
    if (!focus?.sourceId) return;
    if (focus.sourceType === 'task') {
      navigation.navigate('Tasks', {
        screen: 'TaskForm',
        params: { taskId: focus.sourceId },
      });
    } else if (focus.sourceType === 'goal') {
      navigation.navigate('Growth', {
        screen: 'GoalForm',
        params: { goalId: focus.sourceId },
      });
    }
  };

  const notePreview =
    focus?.sourceType === 'custom' && focus.note
      ? truncateNote(focus.note)
      : '';

  return (
    <>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={[styles.accent, { backgroundColor: ACCENT }]} />
          <Text style={styles.title}>Today&apos;s Focus</Text>
        </View>

        {actionError ? <ErrorMessage message={actionError} /> : null}

        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.primary} size="small" />
            <Text style={styles.loadingText}>Loading focus…</Text>
          </View>
        ) : error ? (
          <View style={styles.block}>
            <ErrorMessage message={error} />
            <Button title="Retry" onPress={retry} variant="secondary" />
          </View>
        ) : !focus ? (
          <View style={styles.block}>
            <EmptyState
              title="No focus set yet"
              description="Set one priority to anchor your day."
            />
            <Pressable onPress={() => setModalVisible(true)} hitSlop={8}>
              <Text style={styles.action}>Set focus</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.block}>
            <View style={styles.focusHeader}>
              <Text style={styles.badge}>
                {SOURCE_TYPE_LABELS[focus.sourceType]}
              </Text>
              {focus.completed ? (
                <Text style={styles.completedBadge}>Completed</Text>
              ) : null}
            </View>
            <Text
              style={[
                styles.focusTitle,
                focus.completed && styles.focusTitleDone,
              ]}
              numberOfLines={2}
            >
              {focus.completed ? '✓ ' : ''}
              {focus.title}
            </Text>
            {notePreview ? (
              <Text style={styles.notePreview} numberOfLines={2}>
                {notePreview}
              </Text>
            ) : null}
            <View style={styles.actions}>
              <Pressable
                onPress={handleToggleComplete}
                hitSlop={8}
                disabled={actionLoading}
              >
                <Text style={styles.action}>
                  {focus.completed ? 'Undo complete' : 'Complete'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setModalVisible(true)}
                hitSlop={8}
                disabled={actionLoading}
              >
                <Text style={styles.action}>Change focus</Text>
              </Pressable>
              <Pressable
                onPress={handleClear}
                hitSlop={8}
                disabled={actionLoading}
              >
                <Text style={styles.action}>Clear</Text>
              </Pressable>
              {linkedAvailable && focus.sourceId ? (
                <Pressable onPress={openLinked} hitSlop={8}>
                  <Text style={styles.action}>
                    Open {focus.sourceType === 'task' ? 'task' : 'goal'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        )}
      </Card>

      <FocusSetupModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={setFocus}
        actionsDisabled={actionLoading}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  accent: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  title: {
    ...typography.heading,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  block: {
    gap: spacing.sm,
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  completedBadge: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  focusTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  focusTitleDone: {
    color: colors.textMuted,
  },
  notePreview: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  action: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
});
