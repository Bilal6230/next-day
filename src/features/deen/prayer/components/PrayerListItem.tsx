import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  PRAYER_LABELS,
  PRAYER_STATUS_LABELS,
} from '@/features/deen/prayer/constants';
import type { PrayerKey, PrayerStatus } from '@/features/deen/prayer/types';
import { Card } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type PrayerListItemProps = {
  prayerKey: PrayerKey;
  status: PrayerStatus;
  onPress: () => void;
};

function getStatusBadgeStyle(status: PrayerStatus) {
  switch (status) {
    case 'on_time':
    case 'jamaah':
      return styles.badgeSuccess;
    case 'late':
    case 'qadha':
      return styles.badgeNeutral;
    case 'missed':
      return styles.badgeMissed;
    default:
      return styles.badgePending;
  }
}

function getStatusTextStyle(status: PrayerStatus) {
  switch (status) {
    case 'on_time':
    case 'jamaah':
      return styles.badgeTextSuccess;
    case 'late':
    case 'qadha':
      return styles.badgeTextNeutral;
    case 'missed':
      return styles.badgeTextMissed;
    default:
      return styles.badgeTextPending;
  }
}

export function PrayerListItem({
  prayerKey,
  status,
  onPress,
}: PrayerListItemProps) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.name}>{PRAYER_LABELS[prayerKey]}</Text>
          <View style={[styles.badge, getStatusBadgeStyle(status)]}>
            <Text style={[styles.badgeText, getStatusTextStyle(status)]}>
              {PRAYER_STATUS_LABELS[status]}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    minHeight: 44,
  },
  name: {
    ...typography.body,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  badgePending: {
    backgroundColor: colors.surfaceElevated,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
  },
  badgeNeutral: {
    backgroundColor: colors.primaryMuted,
  },
  badgeMissed: {
    backgroundColor: colors.errorMuted,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '600',
  },
  badgeTextPending: {
    color: colors.textMuted,
  },
  badgeTextSuccess: {
    color: colors.success,
  },
  badgeTextNeutral: {
    color: colors.primary,
  },
  badgeTextMissed: {
    color: colors.error,
  },
});
