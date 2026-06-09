import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useAuth } from '@/app/providers/AuthProvider';
import { createDefaultReminderSettings } from '@/firebase/reminderSettings';
import { subscribeToBills } from '@/firebase/bills';
import { subscribeToDailyFocus } from '@/firebase/dailyFocus';
import { subscribeToHabits } from '@/firebase/habits';
import { subscribeToTasks } from '@/firebase/tasks';
import type { ReminderSettings } from '@/features/reminders/types';
import {
  getReminderPermissionState,
  isPermissionGranted,
} from '@/features/reminders/services/permissions';
import { cancelAllReminderCategories } from '@/features/reminders/services/notifications';
import { syncReminders } from '@/features/reminders/services/scheduler';
import { buildReminderDataSnapshot } from '@/features/reminders/utils/snapshot';
import type { Bill } from '@/features/money/types';
import type { Habit } from '@/features/growth/types';
import { getTodayDateKey } from '@/features/growth/utils/dates';
import type { DailyFocus } from '@/features/today/focus/types';
import type { Task } from '@/features/tasks/types';
import { subscribeToReminderSettings } from '@/firebase/reminderSettings';

type SyncPayload = {
  settings: ReminderSettings;
  focus: DailyFocus | null;
  tasks: Task[];
  bills: Bill[];
  habits: Habit[];
};

export function useRemindersSync(): void {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const previousUidRef = useRef<string | null>(null);
  const payloadRef = useRef<Partial<SyncPayload>>({});
  const syncInFlightRef = useRef(false);

  const runSync = async (targetUid: string) => {
    if (syncInFlightRef.current) return;

    const settings = payloadRef.current.settings;
    if (!settings) return;

    syncInFlightRef.current = true;
    try {
      const permission = await getReminderPermissionState();
      const data = buildReminderDataSnapshot({
        focus: payloadRef.current.focus ?? null,
        tasks: payloadRef.current.tasks ?? [],
        bills: payloadRef.current.bills ?? [],
        habits: payloadRef.current.habits ?? [],
      });

      await syncReminders(targetUid, settings, data, permission);
    } catch {
      // Sync failures must not crash the app.
    } finally {
      syncInFlightRef.current = false;
    }
  };

  const requestSync = (targetUid: string) => {
    void runSync(targetUid);
  };

  useEffect(() => {
    const previousUid = previousUidRef.current;

    if (!uid) {
      if (previousUid) {
        void cancelAllReminderCategories(previousUid);
      }
      payloadRef.current = {};
      previousUidRef.current = null;
      return;
    }

    if (previousUid && previousUid !== uid) {
      void cancelAllReminderCategories(previousUid);
    }

    previousUidRef.current = uid;
    const todayKey = getTodayDateKey();

    const unsubSettings = subscribeToReminderSettings(
      uid,
      (settings) => {
        payloadRef.current.settings = settings ?? createDefaultReminderSettings();
        requestSync(uid);
      },
      () => undefined,
    );

    const unsubFocus = subscribeToDailyFocus(
      uid,
      todayKey,
      (focus) => {
        payloadRef.current.focus = focus;
        requestSync(uid);
      },
      () => undefined,
    );

    const unsubTasks = subscribeToTasks(
      uid,
      'today',
      (tasks) => {
        payloadRef.current.tasks = tasks;
        requestSync(uid);
      },
      () => undefined,
    );

    const unsubBills = subscribeToBills(
      uid,
      (bills) => {
        payloadRef.current.bills = bills;
        requestSync(uid);
      },
      () => undefined,
    );

    const unsubHabits = subscribeToHabits(
      uid,
      (habits) => {
        payloadRef.current.habits = habits;
        requestSync(uid);
      },
      () => undefined,
    );

    void getReminderPermissionState().then((permission) => {
      if (!isPermissionGranted(permission)) return;
      requestSync(uid);
    });

    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        requestSync(uid);
      }
    };

    const appStateSub = AppState.addEventListener('change', handleAppState);

    return () => {
      unsubSettings();
      unsubFocus();
      unsubTasks();
      unsubBills();
      unsubHabits();
      appStateSub.remove();
    };
  }, [uid]);
}
