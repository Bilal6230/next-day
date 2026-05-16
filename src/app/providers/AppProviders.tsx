import { useCallback, useEffect, useState } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { RootNavigator } from '@/app/navigation/RootNavigator';
import { AuthProvider, useAuth } from '@/app/providers/AuthProvider';
import { LoadingOverlay } from '@/shared/components';
import { colors } from '@/shared/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.primary,
  },
};

function AppContent() {
  const { isInitialized, isLoading } = useAuth();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (isInitialized && !isLoading) {
      setAppReady(true);
    }
  }, [isInitialized, isLoading]);

  const onLayout = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return <LoadingOverlay message="Starting Next Day…" />;
  }

  return (
    <View style={styles.root} onLayout={onLayout}>
      <StatusBar style="light" />
      <NavigationContainer theme={navigationTheme}>
        <RootNavigator />
      </NavigationContainer>
    </View>
  );
}

export default function AppProviders() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
