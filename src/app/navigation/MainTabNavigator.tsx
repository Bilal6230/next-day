import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';

import type { MainTabParamList } from '@/app/navigation/types';
import { PlaceholderTabScreen } from '@/app/screens/PlaceholderTabScreen';
import { MoreScreen } from '@/features/more/screens/MoreScreen';
import { TodayScreen } from '@/features/today/screens/TodayScreen';
import { colors, typography } from '@/shared/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
      {label}
    </Text>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Today" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={PlaceholderTabScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Tasks" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Money"
        component={PlaceholderTabScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Money" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Growth"
        component={PlaceholderTabScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Growth" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="More" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 4,
    height: 60,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.tabInactive,
    marginTop: 2,
  },
  tabLabelFocused: {
    color: colors.tabActive,
    fontWeight: '600',
  },
});
