import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { MainTabParamList } from '@/app/navigation/types';
import { PlaceholderTabScreen } from '@/app/screens/PlaceholderTabScreen';
import { GrowthNavigator } from '@/features/growth/navigation/GrowthNavigator';
import { TasksNavigator } from '@/features/tasks/navigation/TasksNavigator';
import { MoreScreen } from '@/features/more/screens/MoreScreen';
import { TodayScreen } from '@/features/today/screens/TodayScreen';
import { colors, typography } from '@/shared/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_BAR_BASE_HEIGHT = 64;

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
      {label}
    </Text>
  );
}

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: [
          styles.tabBar,
          {
            height: TAB_BAR_BASE_HEIGHT + insets.bottom,
            paddingBottom: bottomInset,
          },
        ],
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
        component={TasksNavigator}
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
        component={GrowthNavigator}
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
