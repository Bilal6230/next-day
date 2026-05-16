import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import type { AuthStackParamList } from '@/app/navigation/types';
import { AuthHeader } from '@/features/auth/components/AuthHeader';
import { signIn } from '@/firebase/auth';
import { Button, ErrorMessage, Input, Screen } from '@/shared/components';
import { getAuthErrorMessage } from '@/shared/utils/errors';
import {
  FieldErrors,
  getFirstFieldError,
  validateEmail,
  validatePassword,
} from '@/shared/utils/validation';
import { colors, spacing, typography } from '@/shared/theme';

type LoginNavigation = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginNavigation>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const errors: FieldErrors = {};
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    setFieldErrors(errors);
    setFormError('');

    if (getFirstFieldError(errors)) return;

    setLoading(true);
    try {
      await signIn({ email, password });
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll contentStyle={styles.content}>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to pick up where you left off."
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
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          error={fieldErrors.password}
        />
        <Pressable
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotLink}
        >
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>
        {formError ? <ErrorMessage message={formError} /> : null}
        <Button title="Sign in" onPress={handleSubmit} loading={loading} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to Next Day?</Text>
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Create account</Text>
        </Pressable>
      </View>
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
  forgotLink: {
    alignSelf: 'flex-end',
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
