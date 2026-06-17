import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/shared/theme';

type ReminderMasterToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
};

export function ReminderMasterToggle({
  enabled,
  onChange,
  disabled = false,
}: ReminderMasterToggleProps) {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.title}>Enable reminders</Text>
        <Text style={styles.subtitle}>
          Local daily nudges for focus, habits, tasks, and bills.
        </Text>
      </View>
      <Pressable
        onPress={() => onChange(!enabled)}
        disabled={disabled}
        style={[
          styles.toggle,
          enabled && styles.toggleOn,
          disabled && styles.toggleDisabled,
        ]}
        hitSlop={8}
      >
        <View style={[styles.knob, enabled && styles.knobOn]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  copy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.heading,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  toggleDisabled: {
    opacity: 0.5,
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textMuted,
  },
  knobOn: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
});
