export function clampAzkarCount(count: number): number {
  if (!Number.isFinite(count)) return 0;
  return Math.max(0, Math.floor(count));
}

export function isAzkarCompleted(count: number, targetCount: number): boolean {
  return clampAzkarCount(count) >= targetCount;
}
