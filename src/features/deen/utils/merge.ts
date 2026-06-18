import { PREDEFINED_DHIKRS } from '@/features/deen/constants';
import type {
  CustomDhikr,
  DhikrDashboardRow,
  DhikrProgress,
} from '@/features/deen/types';

function progressMap(
  progressItems: DhikrProgress[],
): Map<string, DhikrProgress> {
  return new Map(progressItems.map((item) => [item.dhikrId, item]));
}

export function buildDhikrDashboardRows(
  customDhikrs: CustomDhikr[],
  progressItems: DhikrProgress[],
): DhikrDashboardRow[] {
  const progressById = progressMap(progressItems);
  const activeCustom = customDhikrs.filter((dhikr) => dhikr.status === 'active');

  const predefinedRows: DhikrDashboardRow[] = PREDEFINED_DHIKRS.map((dhikr) => {
    const progress = progressById.get(dhikr.id);
    return {
      id: dhikr.id,
      sourceType: 'default',
      title: dhikr.title,
      phrase: dhikr.phrase,
      transliteration: dhikr.transliteration,
      translation: dhikr.translation,
      targetCount: dhikr.targetCount,
      category: dhikr.category,
      count: progress?.count ?? 0,
      completed: progress?.completed ?? false,
      canEdit: false,
    };
  });

  const customRows: DhikrDashboardRow[] = activeCustom.map((dhikr) => {
    const progress = progressById.get(dhikr.id);
    return {
      id: dhikr.id,
      sourceType: 'custom',
      title: dhikr.title,
      phrase: dhikr.phrase,
      transliteration: dhikr.transliteration,
      translation: dhikr.translation,
      targetCount: dhikr.targetCount,
      category: dhikr.category,
      count: progress?.count ?? 0,
      completed: progress?.completed ?? false,
      canEdit: true,
    };
  });

  return [...predefinedRows, ...customRows];
}

export function getDhikrDashboardSummary(rows: DhikrDashboardRow[]): {
  completedCount: number;
  totalCount: number;
} {
  const totalCount = rows.length;
  const completedCount = rows.filter((row) => row.completed).length;
  return { completedCount, totalCount };
}
