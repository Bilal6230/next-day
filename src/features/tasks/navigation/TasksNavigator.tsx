import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { TasksStackParamList } from '@/features/tasks/navigation/types';
import { TaskFormScreen } from '@/features/tasks/screens/TaskFormScreen';
import { TasksScreen } from '@/features/tasks/screens/TasksScreen';
import { colors } from '@/shared/theme';

const Stack = createNativeStackNavigator<TasksStackParamList>();

export function TasksNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="TasksList" component={TasksScreen} />
      <Stack.Screen name="TaskForm" component={TaskFormScreen} />
    </Stack.Navigator>
  );
}
