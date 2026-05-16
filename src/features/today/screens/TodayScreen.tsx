import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/app/providers/AuthProvider';
import { DashboardCard } from '@/features/today/components/DashboardCard';
import { TasksDueTodayCard } from '@/features/today/components/TasksDueTodayCard';
import { colors, spacing, typography } from '@/shared/theme';

const OTHER_SECTIONS = [
  {
    title: "Today's Focus",
    emptyTitle: 'No focus set yet',
    emptyDescription: 'Set one priority to anchor your day.',
    accent: colors.primary,
  },
  {
    title: 'Bills Due Soon',
    emptyTitle: 'No upcoming bills',
    emptyDescription: 'Financial reminders will appear here.',
    accent: '#FBBF24',
  },
  {
    title: 'Habit Progress',
    emptyTitle: 'No habits tracked yet',
    emptyDescription: 'Build streaks in Growth when ready.',
    accent: '#34D399',
  },
  {
    title: 'Quick Note',
    emptyTitle: 'No note saved',
    emptyDescription: 'Capture a thought for today.',
    accent: '#F472B6',
  },
] as const;

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
          title={OTHER_SECTIONS[0].title}
          emptyTitle={OTHER_SECTIONS[0].emptyTitle}
          emptyDescription={OTHER_SECTIONS[0].emptyDescription}
          accent={OTHER_SECTIONS[0].accent}
        />
        <TasksDueTodayCard />
        {OTHER_SECTIONS.slice(1).map((section) => (
          <DashboardCard
            key={section.title}
            title={section.title}
            emptyTitle={section.emptyTitle}
            emptyDescription={section.emptyDescription}
            accent={section.accent}
          />
        ))}
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
