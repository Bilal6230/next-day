import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthNavigator } from '@/app/navigation/AuthNavigator';
import { MainTabNavigator } from '@/app/navigation/MainTabNavigator';
import type { RootStackParamList } from '@/app/navigation/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { ConfigRequiredScreen } from '@/features/auth/screens/ConfigRequiredScreen';
import { colors } from '@/shared/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, isConfigured } = useAuth();

  if (!isConfigured) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ConfigRequired" component={ConfigRequiredScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {user ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
