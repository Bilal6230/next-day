import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { DeenStackParamList } from '@/features/deen/navigation/types';
import { DeenScreen } from '@/features/deen/screens/DeenScreen';
import { DhikrCounterScreen } from '@/features/deen/screens/DhikrCounterScreen';
import { DhikrFormScreen } from '@/features/deen/screens/DhikrFormScreen';
import { colors } from '@/shared/theme';

const Stack = createNativeStackNavigator<DeenStackParamList>();

export function DeenNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="DeenHome" component={DeenScreen} />
      <Stack.Screen name="DhikrCounter" component={DhikrCounterScreen} />
      <Stack.Screen name="DhikrForm" component={DhikrFormScreen} />
    </Stack.Navigator>
  );
}
