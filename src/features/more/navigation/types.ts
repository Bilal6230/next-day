import type { NavigatorScreenParams } from '@react-navigation/native';

import type { DeenStackParamList } from '@/features/deen/navigation/types';

export type MoreStackParamList = {
  MoreHome: undefined;
  Deen: NavigatorScreenParams<DeenStackParamList>;
  NotesList: undefined;
  NoteForm: { noteId?: string } | undefined;
  RemindersSettings: undefined;
};
