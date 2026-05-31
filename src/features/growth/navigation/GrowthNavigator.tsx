import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GoalFormScreen } from '@/features/growth/goals/screens/GoalFormScreen';
import type { GrowthStackParamList } from '@/features/growth/navigation/types';
import { GrowthScreen } from '@/features/growth/screens/GrowthScreen';
import { HabitFormScreen } from '@/features/growth/screens/HabitFormScreen';
import { colors } from '@/shared/theme';

const Stack = createNativeStackNavigator<GrowthStackParamList>();

export function GrowthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="GrowthHome" component={GrowthScreen} />
      <Stack.Screen name="HabitForm" component={HabitFormScreen} />
      <Stack.Screen name="GoalForm" component={GoalFormScreen} />
    </Stack.Navigator>
  );
}
