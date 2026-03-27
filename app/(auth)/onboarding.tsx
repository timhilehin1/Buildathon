import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuthStore } from '@/src/store/auth-store';
import { profileApi } from '@/src/api/profile';
import { Button } from '@/src/components/Button';
import { Input } from '@/src/components/Input';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/constants/theme';

const TOTAL_STEPS = 4;

const step1Schema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  username: z.string().min(3, 'At least 3 characters').regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers, underscores only'),
});

const step2Schema = z.object({
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use format YYYY-MM-DD'),
  country: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
});

const step4Schema = z.object({
  bank_name: z.string().optional(),
  bank_code: z.string().optional(),
  account_number: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step4Data = z.infer<typeof step4Schema>;

export default function OnboardingScreen() {
  const { session, setHasProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<Partial<Step1Data & Step2Data>>({});
  const [loading, setLoading] = useState(false);

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) });
  const form4 = useForm<Step4Data>({ resolver: zodResolver(step4Schema) });

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleStep1(data: Step1Data) {
    setProfileData((prev) => ({ ...prev, ...data }));
    setStep(2);
  }

  async function handleStep2(data: Step2Data) {
    setProfileData((prev) => ({ ...prev, ...data }));
    setStep(3);
  }

  async function handleStep3() {
    setStep(4);
  }

  async function handleStep4(data: Step4Data) {
    setLoading(true);
    try {
      await profileApi.create({
        first_name: profileData.first_name ?? '',
        last_name: profileData.last_name ?? '',
        username: profileData.username ?? '',
        date_of_birth: profileData.date_of_birth,
        country: profileData.country,
        state: profileData.state,
        leaderboard_opt_in: false,
        notification_preferences: { push: true, email: false },
      });

      if (data.bank_name && data.account_number && data.bank_code) {
        await profileApi.setPayoutAccount({
          bank_name: data.bank_name,
          bank_code: data.bank_code,
          account_number: data.account_number,
        });
      }

      await setHasProfile(true);
    } catch {
      await setHasProfile(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.progressBar}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i < step ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <View>
            <Text style={styles.stepLabel}>Step 1 of 4</Text>
            <Text style={styles.title}>About you</Text>
            <Text style={styles.sub}>Tell us a bit about yourself</Text>

            <Controller control={form1.control} name="first_name" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="First Name" placeholder="Jane" value={value} onChangeText={onChange} onBlur={onBlur} error={form1.formState.errors.first_name?.message} />
            )} />
            <Controller control={form1.control} name="last_name" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Last Name" placeholder="Doe" value={value} onChangeText={onChange} onBlur={onBlur} error={form1.formState.errors.last_name?.message} />
            )} />
            <Controller control={form1.control} name="username" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Username" placeholder="jane_doe" autoCapitalize="none" value={value} onChangeText={onChange} onBlur={onBlur} error={form1.formState.errors.username?.message} />
            )} />
            <Button label="Continue" onPress={form1.handleSubmit(handleStep1)} />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepLabel}>Step 2 of 4</Text>
            <Text style={styles.title}>Your location</Text>
            <Text style={styles.sub}>Date of birth and where you're based</Text>

            <Controller control={form2.control} name="date_of_birth" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Date of Birth" placeholder="1995-06-15" value={value} onChangeText={onChange} onBlur={onBlur} error={form2.formState.errors.date_of_birth?.message} />
            )} />
            <Controller control={form2.control} name="country" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Country" placeholder="NG" autoCapitalize="characters" value={value} onChangeText={onChange} onBlur={onBlur} error={form2.formState.errors.country?.message} />
            )} />
            <Controller control={form2.control} name="state" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="State" placeholder="Lagos" value={value} onChangeText={onChange} onBlur={onBlur} error={form2.formState.errors.state?.message} />
            )} />

            <View style={styles.row}>
              <Button label="Back" onPress={goBack} variant="secondary" style={styles.half} fullWidth={false} />
              <Button label="Continue" onPress={form2.handleSubmit(handleStep2)} style={styles.half} fullWidth={false} />
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepLabel}>Step 3 of 4</Text>
            <Text style={styles.title}>Permissions</Text>
            <Text style={styles.sub}>Enable features to get the most out of spent-it</Text>

            <View style={styles.permissionItem}>
              <Text style={styles.permIcon}>🔔</Text>
              <View style={styles.permInfo}>
                <Text style={styles.permTitle}>Push Notifications</Text>
                <Text style={styles.permDesc}>Get alerts for sync status and budget warnings</Text>
              </View>
            </View>
            <View style={styles.permissionItem}>
              <Text style={styles.permIcon}>💬</Text>
              <View style={styles.permInfo}>
                <Text style={styles.permTitle}>SMS (Android)</Text>
                <Text style={styles.permDesc}>Automatically detect bank transaction alerts</Text>
              </View>
            </View>

            <View style={styles.row}>
              <Button label="Back" onPress={goBack} variant="secondary" style={styles.half} fullWidth={false} />
              <Button label="Continue" onPress={handleStep3} style={styles.half} fullWidth={false} />
            </View>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={styles.stepLabel}>Step 4 of 4</Text>
            <Text style={styles.title}>Payout account</Text>
            <Text style={styles.sub}>Optional — add your bank account for rewards redemption</Text>

            <Controller control={form4.control} name="bank_name" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Bank Name (optional)" placeholder="First Bank" value={value} onChangeText={onChange} onBlur={onBlur} />
            )} />
            <Controller control={form4.control} name="bank_code" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Bank Code (optional)" placeholder="011" keyboardType="number-pad" value={value} onChangeText={onChange} onBlur={onBlur} />
            )} />
            <Controller control={form4.control} name="account_number" render={({ field: { onChange, value, onBlur } }) => (
              <Input label="Account Number (optional)" placeholder="0123456789" keyboardType="number-pad" maxLength={10} value={value} onChangeText={onChange} onBlur={onBlur} />
            )} />

            <View style={styles.row}>
              <Button label="Back" onPress={goBack} variant="secondary" style={styles.half} fullWidth={false} />
              <Button label="Get Started" onPress={form4.handleSubmit(handleStep4)} loading={loading} style={styles.half} fullWidth={false} />
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  dot: {
    width: 24,
    height: 4,
    borderRadius: Radius.full,
  },
  dotActive: { backgroundColor: Colors.primary },
  dotInactive: { backgroundColor: Colors.border },
  container: { flexGrow: 1, padding: Spacing.lg },
  stepLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, marginBottom: Spacing.xs },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.xs },
  sub: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.xl },
  row: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  half: { flex: 1 },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  permIcon: { fontSize: 24 },
  permInfo: { flex: 1 },
  permTitle: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text },
  permDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
});
