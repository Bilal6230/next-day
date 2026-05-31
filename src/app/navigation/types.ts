import type { NavigatorScreenParams } from '@react-navigation/native';

import type { GrowthStackParamList } from '@/features/growth/navigation/types';
import type { MoreStackParamList } from '@/features/more/navigation/types';
import type { MoneyStackParamList } from '@/features/money/navigation/types';
import type { TasksStackParamList } from '@/features/tasks/navigation/types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Today: undefined;
  Tasks: NavigatorScreenParams<TasksStackParamList>;
  Money: NavigatorScreenParams<MoneyStackParamList>;
  Growth: NavigatorScreenParams<GrowthStackParamList>;
  More: NavigatorScreenParams<MoreStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  ConfigRequired: undefined;
};

