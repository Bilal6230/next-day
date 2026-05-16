import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import type { AuthStackParamList } from '@/app/navigation/types';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { signUp } from '@/firebase/auth';
import { Button, ErrorMessage, Input, Screen } from '@/shared/components';
import { getAuthErrorMessage } from '@/shared/utils/errors';
import {
  FieldErrors,
  getFirstFieldError,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
} from '@/shared/utils/validation';
import { colors, spacing, typography } from '@/shared/theme';

type RegisterNavigation = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;

export function RegisterScreen() {
  const navigation = useNavigation<RegisterNavigation>();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const errors: FieldErrors = {};
    const displayNameError = validateDisplayName(displayName);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmError = validatePasswordMatch(password, confirmPassword);
    if (displayNameError) errors.displayName = displayNameError;
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    if (confirmError) errors.confirmPassword = confirmError;
    setFieldErrors(errors);
    setFormError('');

    if (getFirstFieldError(errors)) return;

    setLoading(true);
    try {
      await signUp({ email, password, displayName });
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <AuthHeader
        title="Create account"
        subtitle="Start planning your next day with clarity."
      />

      <View style={styles.form}>
        <Input
          label="Name"
          value={displayName}
          onChangeText={setDisplayName}
          autoComplete="name"
          error={fieldErrors.displayName}
        />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={fieldErrors.email}
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          error={fieldErrors.password}
        />
        <Input
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
        />
        {formError ? <ErrorMessage message={formError} /> : null}
        <Button title="Create account" onPress={handleSubmit} loading={loading} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Pressable onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Sign in</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
  },
  form: {
    gap: spacing.md,
  },
  link: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
