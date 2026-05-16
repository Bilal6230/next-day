import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

export function ConfigRequiredScreen() {
  return (
    <Screen scroll contentStyle={styles.content}>
      <Text style={styles.brand}>Next Day</Text>
      <Text style={styles.title}>Firebase setup required</Text>
      <Text style={styles.body}>
        Copy <Text style={styles.mono}>.env.example</Text> to{' '}
        <Text style={styles.mono}>.env</Text> and add your Firebase project
        values from the Firebase Console.
      </Text>
      <View style={styles.steps}>
        <Text style={styles.step}>1. Create a Firebase project</Text>
        <Text style={styles.step}>2. Enable Email/Password authentication</Text>
        <Text style={styles.step}>3. Create a Firestore database</Text>
        <Text style={styles.step}>4. Deploy firestore.rules from this repo</Text>
        <Text style={styles.step}>5. Restart Expo after updating .env</Text>
      </View>
      <Text style={styles.note}>
        Never commit real secrets. Client API keys are expected in the app bundle;
        protect data with Firestore rules and Firebase App Check.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  brand: {
    ...typography.label,
    color: colors.primary,
  },
  title: {
    ...typography.title,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  mono: {
    fontFamily: 'monospace',
    color: colors.textPrimary,
  },
  steps: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  step: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  note: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
