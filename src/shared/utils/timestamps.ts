type TimestampLike = { toMillis?: () => number } | null | undefined;

export function timestampMillis(value: TimestampLike): number {
  return value?.toMillis?.() ?? 0;
}
