export function clampDhikrCount(count: number): number {
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.floor(count));
}

export function isDhikrCompleted(count: number, targetCount: number): boolean {
  return clampDhikrCount(count) >= targetCount;
}

export function getDhikrProgressPercent(count: number, targetCount: number): number {
  if (targetCount <= 0) return 0;
  const clamped = clampDhikrCount(count);
  return Math.min(100, Math.round((clamped / targetCount) * 100));
}
