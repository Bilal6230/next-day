import type { PredefinedDhikr } from '@/features/deen/types';

export const DEFAULT_DHIKR_CATEGORY = 'Custom';
export const PREDEFINED_DHIKR_CATEGORY = 'Common';

export const PREDEFINED_DHIKRS: PredefinedDhikr[] = [
  {
    id: 'default-subhanallah',
    title: 'SubhanAllah',
    phrase: 'سبحان الله',
    transliteration: 'SubhanAllah',
    translation: 'Glory be to Allah',
    targetCount: 33,
    category: PREDEFINED_DHIKR_CATEGORY,
  },
  {
    id: 'default-alhamdulillah',
    title: 'Alhamdulillah',
    phrase: 'الحمد لله',
    transliteration: 'Alhamdulillah',
    translation: 'All praise is for Allah',
    targetCount: 33,
    category: PREDEFINED_DHIKR_CATEGORY,
  },
  {
    id: 'default-allahu-akbar',
    title: 'Allahu Akbar',
    phrase: 'الله أكبر',
    transliteration: 'Allahu Akbar',
    translation: 'Allah is the Greatest',
    targetCount: 34,
    category: PREDEFINED_DHIKR_CATEGORY,
  },
  {
    id: 'default-astaghfirullah',
    title: 'Astaghfirullah',
    phrase: 'أستغفر الله',
    transliteration: 'Astaghfirullah',
    translation: 'I seek forgiveness from Allah',
    targetCount: 100,
    category: PREDEFINED_DHIKR_CATEGORY,
  },
  {
    id: 'default-la-ilaha-illa-allah',
    title: 'La ilaha illa Allah',
    phrase: 'لا إله إلا الله',
    transliteration: 'La ilaha illa Allah',
    translation: 'There is no god but Allah',
    targetCount: 100,
    category: PREDEFINED_DHIKR_CATEGORY,
  },
  {
    id: 'default-salawat',
    title: 'Salawat',
    phrase: 'اللهم صل على محمد',
    transliteration: 'Allahumma salli ala Muhammad',
    translation: 'O Allah, send blessings upon Muhammad',
    targetCount: 10,
    category: PREDEFINED_DHIKR_CATEGORY,
  },
];

export function getPredefinedDhikr(id: string): PredefinedDhikr | undefined {
  return PREDEFINED_DHIKRS.find((dhikr) => dhikr.id === id);
}

export const DHIKR_PHRASE_PREVIEW_LENGTH = 48;
