import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import type { DhikrProgress, DhikrSourceType } from '@/features/deen/types';
import {
  getDhikrProgressPercent,
  isDhikrCompleted,
} from '@/features/deen/utils/progress';
import {
  resetDhikrProgressToday,
  setDhikrProgressCount,
  subscribeToDhikrProgressItem,
} from '@/firebase/dhikrProgress';
import { useActionLock } from '@/shared/hooks/useActionLock';
import { getFirestoreErrorMessage } from '@/shared/utils/errors';

const PERSIST_DEBOUNCE_MS = 400;

type DhikrDefinition = {
  title: string;
  phrase: string;
  transliteration: string | null;
  translation: string | null;
  targetCount: number;
};

type UseDhikrCounterParams = {
  uid: string | undefined;
  dateKey: string;
  dhikrId: string;
  sourceType: DhikrSourceType;
  definition: DhikrDefinition;
};

export function useDhikrCounter({
  uid,
  dateKey,
  dhikrId,
  sourceType,
  definition,
}: UseDhikrCounterParams) {
  const navigation = useNavigation();
  const [progress, setProgress] = useState<DhikrProgress | null>(null);
  const [localCount, setLocalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [persistError, setPersistError] = useState('');
  const { busy: resetting, runLocked } = useActionLock();

  const pendingCountRef = useRef<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPendingWriteRef = useRef(false);
  const progressRef = useRef<DhikrProgress | null>(null);

  const targetCount =
    progress?.targetCountSnapshot ?? definition.targetCount;
  const completed = isDhikrCompleted(localCount, targetCount);
  const progressPercent = getDhikrProgressPercent(localCount, targetCount);

  const flushPersist = useCallback(async () => {
    if (!uid || pendingCountRef.current === null) return;

    const count = pendingCountRef.current;
    pendingCountRef.current = null;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    try {
      await setDhikrProgressCount(uid, dateKey, {
        dhikrId,
        sourceType,
        titleSnapshot: definition.title,
        phraseSnapshot: definition.phrase,
        targetCountSnapshot: definition.targetCount,
        count,
      });
      hasPendingWriteRef.current = false;
      setPersistError('');
    } catch (err) {
      hasPendingWriteRef.current = false;
      setPersistError(getFirestoreErrorMessage(err));
      const serverCount = progressRef.current?.count ?? 0;
      setLocalCount(serverCount);
    }
  }, [uid, dateKey, dhikrId, sourceType, definition]);

  const schedulePersist = useCallback(
    (count: number) => {
      pendingCountRef.current = count;
      hasPendingWriteRef.current = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        void flushPersist();
      }, PERSIST_DEBOUNCE_MS);
    },
    [flushPersist],
  );

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError('');

    const unsubscribe = subscribeToDhikrProgressItem(
      uid,
      dateKey,
      dhikrId,
      (item) => {
        progressRef.current = item;
        setProgress(item);
        setLoading(false);
        if (!hasPendingWriteRef.current) {
          setLocalCount(item?.count ?? 0);
        }
      },
      (err) => {
        setLoadError(getFirestoreErrorMessage(err));
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [uid, dateKey, dhikrId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      void flushPersist();
    });
    return unsubscribe;
  }, [navigation, flushPersist]);

  useEffect(() => {
    return () => {
      void flushPersist();
    };
  }, [flushPersist]);

  const increment = useCallback(() => {
    setLocalCount((current) => {
      const next = current + 1;
      schedulePersist(next);
      return next;
    });
  }, [schedulePersist]);

  const decrement = useCallback(() => {
    setLocalCount((current) => {
      const next = Math.max(0, current - 1);
      schedulePersist(next);
      return next;
    });
  }, [schedulePersist]);

  const resetToday = useCallback(() => {
    if (!uid) return;

    runLocked(async () => {
      setPersistError('');
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      pendingCountRef.current = null;
      hasPendingWriteRef.current = false;
      setLocalCount(0);

      try {
        await resetDhikrProgressToday(uid, dateKey, dhikrId);
      } catch (err) {
        setPersistError(getFirestoreErrorMessage(err));
        const serverCount = progressRef.current?.count ?? 0;
        setLocalCount(serverCount);
      }
    });
  }, [uid, dateKey, dhikrId, runLocked]);

  return {
    localCount,
    targetCount,
    completed,
    progressPercent,
    loading,
    loadError,
    persistError,
    resetting,
    increment,
    decrement,
    resetToday,
  };
}
