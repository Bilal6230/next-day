import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { MoneyStackParamList } from '@/features/money/navigation/types';
import { BillFormScreen } from '@/features/money/screens/BillFormScreen';
import { ExpenseFormScreen } from '@/features/money/screens/ExpenseFormScreen';
import { MoneyScreen } from '@/features/money/screens/MoneyScreen';
import { colors } from '@/shared/theme';

const Stack = createNativeStackNavigator<MoneyStackParamList>();

export function MoneyNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MoneyHome" component={MoneyScreen} />
      <Stack.Screen name="BillForm" component={BillFormScreen} />
      <Stack.Screen name="ExpenseForm" component={ExpenseFormScreen} />
    </Stack.Navigator>
  );
}
