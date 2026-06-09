import { useCallback, useRef, useState } from 'react';

export function useActionLock() {
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const runLocked = useCallback(async (fn: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await fn();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);

  return { busy, runLocked };
}
