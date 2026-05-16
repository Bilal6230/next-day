import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import type { AuthStackParamList } from '@/app/navigation/types';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { resetPassword } from '@/firebase/auth';
import { Button, ErrorMessage, Input, Screen } from '@/shared/components';
import { getAuthErrorMessage } from '@/shared/utils/errors';
import {
  FieldErrors,
  getFirstFieldError,
  validateEmail,
} from '@/shared/utils/validation';
import { colors, spacing, typography } from '@/shared/theme';

type ForgotPasswordNavigation = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

export function ForgotPasswordScreen() {
  const navigation = useNavigation<ForgotPasswordNavigation>();
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const errors: FieldErrors = {};
    const emailError = validateEmail(email);
    if (emailError) errors.email = emailError;
    setFieldErrors(errors);
    setFormError('');
    setSuccessMessage('');

    if (getFirstFieldError(errors)) return;

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccessMessage(
        'If an account exists for this email, you will receive reset instructions shortly.',
      );
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <AuthHeader
        title="Reset password"
        subtitle="Enter your email and we will send you a reset link."
      />

      <View style={styles.form}>
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={fieldErrors.email}
        />
        {formError ? <ErrorMessage message={formError} /> : null}
        {successMessage ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        ) : null}
        <Button title="Send reset link" onPress={handleSubmit} loading={loading} />
      </View>

      <Pressable
        onPress={() => navigation.navigate('Login')}
        style={styles.backLink}
      >
        <Text style={styles.link}>Back to sign in</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  form: {
    gap: spacing.md,
  },
  successBox: {
    backgroundColor: colors.primaryMuted,
    borderRadius: 12,
    padding: spacing.md,
  },
  successText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  backLink: {
    alignSelf: 'center',
    marginTop: spacing.xl,
  },
  link: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
});
