import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/app/providers/AuthProvider';
import { subscribeToHabitCheckins, subscribeToHabits } from '@/firebase/habits';
import type { Habit, HabitProgressRow } from '@/features/growth/types';
import { getTodayDateKey } from '@/features/growth/utils/dates';
import { countWeeklyCompletions } from '@/features/growth/utils/weekly';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

type UseHabitsProgressResult = {
  activeHabits: Habit[];
  progressRows: HabitProgressRow[];
  completedTodayCount: number;
  totalActiveHabits: number;
  weeklyCompletionCount: number;
  isLoading: boolean;
  error: string;
  retry: () => void;
};

export function useHabitsProgress(): UseHabitsProgressResult {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkinsByHabit, setCheckinsByHabit] = useState<Record<string, Set<string>>>(
    {},
  );
  const [habitsLoading, setHabitsLoading] = useState(true);
  const [checkinsLoading, setCheckinsLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const retry = () => {
    setError('');
    setHabitsLoading(true);
    setCheckinsLoading(true);
    setRetryCount((count) => count + 1);
  };

  useEffect(() => {
    if (!user?.uid) {
      setHabits([]);
      setCheckinsByHabit({});
      setHabitsLoading(false);
      setCheckinsLoading(false);
      setError('');
      return;
    }

    setHabitsLoading(true);
    setError('');

    const unsubscribe = subscribeToHabits(
      user.uid,
      (nextHabits) => {
        setHabits(nextHabits);
        setHabitsLoading(false);
      },
      (err) => {
        setError(getFirestoreErrorMessage(err));
        setHabitsLoading(false);
        setCheckinsLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.uid, retryCount]);

  const activeHabits = useMemo(
    () =>
      habits
        .filter((habit) => habit.status === 'active')
        .sort((a, b) => a.title.localeCompare(b.title)),
    [habits],
  );

  const activeHabitIds = useMemo(
    () => activeHabits.map((habit) => habit.id).join(','),
    [activeHabits],
  );

  useEffect(() => {
    if (!user?.uid) return;

    if (activeHabits.length === 0) {
      setCheckinsByHabit({});
      setCheckinsLoading(false);
      return;
    }

    setCheckinsLoading(true);
    const unsubs = activeHabits.map((habit) =>
      subscribeToHabitCheckins(
        user.uid,
        habit.id,
        (checkins) => {
          setCheckinsByHabit((prev) => ({
            ...prev,
            [habit.id]: new Set(checkins.map((c) => c.dateKey)),
          }));
          setCheckinsLoading(false);
        },
        (err) => {
          setError(getFirestoreErrorMessage(err));
          setCheckinsLoading(false);
        },
      ),
    );

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [user?.uid, activeHabitIds, retryCount]);

  const todayKey = getTodayDateKey();

  const progressRows: HabitProgressRow[] = useMemo(
    () =>
      activeHabits.map((habit) => ({
        habit,
        isDoneToday: checkinsByHabit[habit.id]?.has(todayKey) ?? false,
      })),
    [activeHabits, checkinsByHabit, todayKey],
  );

  const completedTodayCount = useMemo(
    () => progressRows.filter((row) => row.isDoneToday).length,
    [progressRows],
  );

  const weeklyCompletionCount = useMemo(
    () => countWeeklyCompletions(checkinsByHabit),
    [checkinsByHabit],
  );

  return {
    activeHabits,
    progressRows,
    completedTodayCount,
    totalActiveHabits: activeHabits.length,
    weeklyCompletionCount,
    isLoading: habitsLoading || checkinsLoading,
    error,
    retry,
  };
}
