import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuthStore } from '@/src/store/auth-store';
import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { Colors, FontSize, FontWeight, Spacing } from '@/src/constants/theme';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuthStore();
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError('');
    try {
      await signIn(data.email, data.password);
    } catch {
      setError('Sign in failed. Please try again.');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>spent-it</Text>
          <Text style={styles.tagline}>Track every naira</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.sub}>Sign in to continue</Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Email"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoComplete="email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                label="Password"
                placeholder="••••••••"
                secureToggle
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.link}>
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, padding: Spacing.lg },
  header: { paddingTop: Spacing.xxl, paddingBottom: Spacing.xxl, alignItems: 'center' },
  logo: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    letterSpacing: -1,
  },
  tagline: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  form: { flex: 1 },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.xs },
  sub: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.xl },
  error: {
    fontSize: FontSize.sm,
    color: Colors.error,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  link: { marginTop: Spacing.lg, alignItems: 'center' },
  linkText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  linkBold: { fontWeight: FontWeight.semibold, color: Colors.text },
});
