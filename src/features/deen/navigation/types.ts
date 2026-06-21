export type DeenStackParamList = {
  DeenHome: undefined;
  DhikrCounter: { dhikrId: string; sourceType: 'default' | 'custom' };
  DhikrForm: { dhikrId?: string };
  AzkarHome: undefined;
  AzkarForm: { azkarItemId?: string; routine: 'morning' | 'evening' };
};
