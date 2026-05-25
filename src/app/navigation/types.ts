import type { NavigatorScreenParams } from '@react-navigation/native';

import type { GrowthStackParamList } from '@/features/growth/navigation/types';
import type { TasksStackParamList } from '@/features/tasks/navigation/types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Today: undefined;
  Tasks: NavigatorScreenParams<TasksStackParamList>;
  Money: undefined;
  Growth: NavigatorScreenParams<GrowthStackParamList>;
  More: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  ConfigRequired: undefined;
};
