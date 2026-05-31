import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/app/providers/AuthProvider';
import { BillsDueSoonCard } from '@/features/today/components/BillsDueSoonCard';
import { DashboardCard } from '@/features/today/components/DashboardCard';
import { HabitProgressCard } from '@/features/today/components/HabitProgressCard';
import { QuickNoteCard } from '@/features/today/components/QuickNoteCard';
import { TasksDueTodayCard } from '@/features/today/components/TasksDueTodayCard';
import { colors, spacing, typography } from '@/shared/theme';

const FOCUS_SECTION = {
  title: "Today's Focus",
  emptyTitle: 'No focus set yet',
  emptyDescription: 'Set one priority to anchor your day.',
  accent: colors.primary,
} as const;

export function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const greetingName =
    user?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good day, {greetingName}</Text>
        <Text style={styles.dateLabel}>Your dashboard</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <DashboardCard
          title={FOCUS_SECTION.title}
          emptyTitle={FOCUS_SECTION.emptyTitle}
          emptyDescription={FOCUS_SECTION.emptyDescription}
          accent={FOCUS_SECTION.accent}
        />
        <TasksDueTodayCard />
        <BillsDueSoonCard />
        <HabitProgressCard />
        <QuickNoteCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  greeting: {
    ...typography.title,
  },
  dateLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
  },
});
