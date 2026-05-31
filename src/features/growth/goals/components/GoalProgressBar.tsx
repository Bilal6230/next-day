import { StyleSheet, View } from 'react-native';

import { colors, radius } from '@/shared/theme';

type GoalProgressBarProps = {
  percent: number;
};

export function GoalProgressBar({ percent }: GoalProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },
});
