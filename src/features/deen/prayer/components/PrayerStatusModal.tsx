import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  PRAYER_LABELS,
  PRAYER_STATUS_LABELS,
  SELECTABLE_PRAYER_STATUSES,
} from '@/features/deen/prayer/constants';
import type { PrayerKey, PrayerStatus } from '@/features/deen/prayer/types';
import { colors, radius, spacing, typography } from '@/shared/theme';

type PrayerStatusModalProps = {
  visible: boolean;
  prayerKey: PrayerKey | null;
  onClose: () => void;
  onSelectStatus: (status: PrayerStatus) => void;
  disabled?: boolean;
};

const STATUS_OPTIONS: { status: PrayerStatus; label: string }[] = [
  ...SELECTABLE_PRAYER_STATUSES.map((status) => ({
    status,
    label: PRAYER_STATUS_LABELS[status],
  })),
];

export function PrayerStatusModal({
  visible,
  prayerKey,
  onClose,
  onSelectStatus,
  disabled = false,
}: PrayerStatusModalProps) {
  const insets = useSafeAreaInsets();

  if (!prayerKey) return null;

  const handleSelect = (status: PrayerStatus) => {
    if (disabled) return;
    onSelectStatus(status);
    onClose();
  };

  const handleReset = () => {
    if (disabled) return;
    onSelectStatus('pending');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={styles.title}>{PRAYER_LABELS[prayerKey]}</Text>
          <Text style={styles.subtitle}>Set prayer status</Text>

          <View style={styles.options}>
            {STATUS_OPTIONS.map((option) => (
              <Pressable
                key={option.status}
                onPress={() => handleSelect(option.status)}
                disabled={disabled}
                style={({ pressed }) => [
                  styles.option,
                  pressed && !disabled && styles.optionPressed,
                  disabled && styles.optionDisabled,
                ]}
              >
                <Text style={styles.optionText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleReset}
            disabled={disabled}
            style={({ pressed }) => [
              styles.reset,
              pressed && !disabled && styles.optionPressed,
              disabled && styles.optionDisabled,
            ]}
          >
            <Text style={styles.resetText}>Reset to pending</Text>
          </Pressable>

          <Pressable onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  title: {
    ...typography.heading,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  options: {
    gap: spacing.sm,
  },
  option: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  optionPressed: {
    backgroundColor: colors.surfaceHighlight,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  optionText: {
    ...typography.body,
    fontWeight: '500',
  },
  reset: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  resetText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cancel: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cancelText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
});
