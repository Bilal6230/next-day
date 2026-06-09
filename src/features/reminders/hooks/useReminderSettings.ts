import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/app/providers/AuthProvider';
import type {
  ReminderFormValues,
  ReminderSettings,
} from '@/features/reminders/types';
import {
  createDefaultReminderSettings,
  saveReminderSettings,
  subscribeToReminderSettings,
} from '@/firebase/reminderSettings';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

type UseReminderSettingsResult = {
  settings: ReminderSettings;
  isNew: boolean;
  isLoading: boolean;
  error: string;
  retry: () => void;
  saveSettings: (input: ReminderFormValues) => Promise<void>;
};

export function useReminderSettings(): UseReminderSettingsResult {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ReminderSettings>(
    createDefaultReminderSettings(),
  );
  const [isNew, setIsNew] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const retry = useCallback(() => {
    setError('');
    setIsLoading(true);
    setRetryCount((count) => count + 1);
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setSettings(createDefaultReminderSettings());
      setIsNew(true);
      setIsLoading(false);
      setError('');
      return;
    }

    setIsLoading(true);
    setError('');

    const unsubscribe = subscribeToReminderSettings(
      user.uid,
      (nextSettings) => {
        if (nextSettings) {
          setSettings(nextSettings);
          setIsNew(false);
        } else {
          setSettings(createDefaultReminderSettings());
          setIsNew(true);
        }
        setIsLoading(false);
        setError('');
      },
      (err) => {
        setError(getFirestoreErrorMessage(err));
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [user?.uid, retryCount]);

  const saveSettings = useCallback(
    async (input: ReminderFormValues) => {
      if (!user?.uid) return;
      await saveReminderSettings(user.uid, input, isNew);
    },
    [user?.uid, isNew],
  );

  return {
    settings,
    isNew,
    isLoading,
    error,
    retry,
    saveSettings,
  };
}
