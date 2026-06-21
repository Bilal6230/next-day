import type { AzkarRoutine, PredefinedAzkar } from '@/features/deen/azkar/types';

export const DEFAULT_AZKAR_CATEGORY = 'Custom';
export const PREDEFINED_AZKAR_CATEGORY = 'Starter';
export const AZKAR_PHRASE_PREVIEW_LENGTH = 48;

const STARTER_ENTRIES = [
  {
    suffix: 'astaghfirullah',
    title: 'Astaghfirullah',
    phrase: 'أستغفر الله',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
  },
  {
    suffix: 'subhanallah',
    title: 'SubhanAllah',
    phrase: 'سبحان الله',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah',
  },
  {
    suffix: 'alhamdulillah',
    title: 'Alhamdulillah',
    phrase: 'الحمد لله',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is for Allah',
  },
  {
    suffix: 'allahu-akbar',
    title: 'Allahu Akbar',
    phrase: 'الله أكبر',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
  },
  {
    suffix: 'salawat',
    title: 'Salawat',
    phrase: 'اللهم صل على محمد',
    transliteration: 'Allahumma salli ala Muhammad',
    translation: 'O Allah, send blessings upon Muhammad',
  },
] as const;

function buildPredefinedForRoutine(routine: AzkarRoutine): PredefinedAzkar[] {
  return STARTER_ENTRIES.map((entry) => ({
    id: `default-${routine}-${entry.suffix}`,
    title: entry.title,
    phrase: entry.phrase,
    transliteration: entry.transliteration,
    translation: entry.translation,
    targetCount: 1,
    routine,
    category: PREDEFINED_AZKAR_CATEGORY,
  }));
}

export const PREDEFINED_MORNING_AZKAR = buildPredefinedForRoutine('morning');
export const PREDEFINED_EVENING_AZKAR = buildPredefinedForRoutine('evening');
export const PREDEFINED_AZKAR: PredefinedAzkar[] = [
  ...PREDEFINED_MORNING_AZKAR,
  ...PREDEFINED_EVENING_AZKAR,
];

export function getPredefinedAzkar(id: string): PredefinedAzkar | undefined {
  return PREDEFINED_AZKAR.find((item) => item.id === id);
}

export function getRoutineLabel(routine: AzkarRoutine): string {
  return routine === 'morning' ? 'Morning' : 'Evening';
}
