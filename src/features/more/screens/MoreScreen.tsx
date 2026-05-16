import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/app/providers/AuthProvider';
import { logOut } from '@/firebase/auth';
import { Button, ErrorMessage, Screen } from '@/shared/components';
import { getAuthErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

export function MoreScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignOut = async () => {
    setError('');
    setLoading(true);
    try {
      await logOut();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>More</Text>
        <Text style={styles.subtitle}>
          Signed in as {user?.email ?? 'your account'}
        </Text>
        {error ? <ErrorMessage message={error} /> : null}
        <Button
          title="Sign out"
          variant="secondary"
          onPress={handleSignOut}
          loading={loading}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
