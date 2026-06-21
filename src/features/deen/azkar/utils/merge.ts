import {
  PREDEFINED_EVENING_AZKAR,
  PREDEFINED_MORNING_AZKAR,
} from '@/features/deen/azkar/constants';
import type {
  AzkarDashboardRow,
  AzkarProgress,
  AzkarRoutine,
  AzkarRoutineSummary,
  CustomAzkarItem,
} from '@/features/deen/azkar/types';

function progressMap(
  progressItems: AzkarProgress[],
): Map<string, AzkarProgress> {
  return new Map(progressItems.map((item) => [item.azkarItemId, item]));
}

function buildRowsForRoutine(
  predefined: typeof PREDEFINED_MORNING_AZKAR,
  customItems: CustomAzkarItem[],
  progressById: Map<string, AzkarProgress>,
  routine: AzkarRoutine,
): AzkarDashboardRow[] {
  const activeCustom = customItems.filter(
    (item) => item.status === 'active' && item.routine === routine,
  );

  const predefinedRows: AzkarDashboardRow[] = predefined.map((item) => {
    const progress = progressById.get(item.id);
    return {
      id: item.id,
      sourceType: 'default',
      routine: item.routine,
      title: item.title,
      phrase: item.phrase,
      transliteration: item.transliteration,
      translation: item.translation,
      targetCount: item.targetCount,
      category: item.category,
      completed: progress?.completed ?? false,
      canEdit: false,
    };
  });

  const customRows: AzkarDashboardRow[] = activeCustom.map((item) => {
    const progress = progressById.get(item.id);
    return {
      id: item.id,
      sourceType: 'custom',
      routine: item.routine,
      title: item.title,
      phrase: item.phrase,
      transliteration: item.transliteration,
      translation: item.translation,
      targetCount: item.targetCount,
      category: item.category,
      completed: progress?.completed ?? false,
      canEdit: true,
    };
  });

  return [...predefinedRows, ...customRows];
}

export function buildAzkarDashboardRows(
  customItems: CustomAzkarItem[],
  progressItems: AzkarProgress[],
): {
  morningRows: AzkarDashboardRow[];
  eveningRows: AzkarDashboardRow[];
} {
  const progressById = progressMap(progressItems);

  return {
    morningRows: buildRowsForRoutine(
      PREDEFINED_MORNING_AZKAR,
      customItems,
      progressById,
      'morning',
    ),
    eveningRows: buildRowsForRoutine(
      PREDEFINED_EVENING_AZKAR,
      customItems,
      progressById,
      'evening',
    ),
  };
}

export function getAzkarRoutineSummary(
  rows: AzkarDashboardRow[],
): AzkarRoutineSummary {
  const totalCount = rows.length;
  const completedCount = rows.filter((row) => row.completed).length;
  return { completedCount, totalCount };
}
