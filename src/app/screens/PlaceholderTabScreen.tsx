import { RouteProp, useRoute } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

import type { MainTabParamList } from '@/app/navigation/types';
import { Screen } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type PlaceholderRoute = RouteProp<MainTabParamList, 'Money'>;

const PLACEHOLDER_COPY: Record<
  PlaceholderRoute['name'],
  { title: string; subtitle: string }
> = {
  Money: {
    title: 'Money',
    subtitle:
      'Track bills and budgets. Amounts will use integer cents — never floats.',
  },
};

export function PlaceholderTabScreen() {
  const route = useRoute<PlaceholderRoute>();
  const copy = PLACEHOLDER_COPY[route.name];

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
