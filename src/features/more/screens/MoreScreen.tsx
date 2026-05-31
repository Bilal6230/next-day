import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '@/app/providers/AuthProvider';
import type { MoreStackParamList } from '@/features/more/navigation/types';
import { logOut } from '@/firebase/auth';
import { Button, Card, ErrorMessage, Screen } from '@/shared/components';
import { getAuthErrorMessage } from '@/shared/utils/errors';
import { colors, spacing, typography } from '@/shared/theme';

type MoreHomeNavigation = NativeStackNavigationProp<
  MoreStackParamList,
  'MoreHome'
>;

export function MoreScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MoreHomeNavigation>();
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
      <View
        style={[
          styles.container,
          { paddingTop: insets.top + spacing.md },
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
      >
        <Text style={styles.title}>More</Text>
        <Text style={styles.subtitle}>
          Signed in as {user?.email ?? 'your account'}
        </Text>

        <Pressable onPress={() => navigation.navigate('NotesList')}>
          <Card style={styles.notesCard}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesSubtitle}>
              Capture thoughts, pin important notes, and search locally.
            </Text>
          </Card>
        </Pressable>

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
    gap: spacing.md,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  notesCard: {
    marginVertical: spacing.sm,
  },
  notesTitle: {
    ...typography.heading,
    marginBottom: spacing.xs,
  },
  notesSubtitle: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
});
