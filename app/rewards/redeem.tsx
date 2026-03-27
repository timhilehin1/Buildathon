import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useRewards, useRedeem } from '@/src/hooks/use-rewards';
import { usePayoutAccount } from '@/src/hooks/use-profile';
import { Header } from '@/src/components/Header';
import { Card } from '@/src/components/Card';
import { Button } from '@/src/components/Button';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { EmptyState } from '@/src/components/EmptyState';
import { Colors, FontSize, FontWeight, Spacing } from '@/src/constants/theme';

export default function RedeemScreen() {
  const router = useRouter();
  const { data: rewards, isLoading } = useRewards();
  const { data: payoutAccount } = usePayoutAccount();
  const redeem = useRedeem();
  const [pointsInput, setPointsInput] = useState('');

  if (isLoading) return <LoadingSpinner />;

  if (!rewards) {
    return (
      <View style={styles.flex}>
        <Header title="Redeem Points" showBack />
        <EmptyState title="No rewards data" />
      </View>
    );
  }

  if (!payoutAccount) {
    return (
      <View style={styles.flex}>
        <Header title="Redeem Points" showBack />
        <EmptyState
          icon="🏦"
          title="No payout account"
          description="Add a bank account in your profile before redeeming points"
        />
        <View style={styles.footer}>
          <Button label="Go to Profile" onPress={() => router.push('/(tabs)/profile')} />
        </View>
      </View>
    );
  }

  const points = parseInt(pointsInput) || 0;
  const isValid = points >= 500 && points <= rewards.redeemable_points;

  async function handleRedeem() {
    if (!isValid) return;
    Alert.alert(
      'Confirm Redemption',
      `Redeem ${points.toLocaleString()} points to ${payoutAccount?.bank_name} ****${payoutAccount?.account_number.slice(-4)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await redeem.mutateAsync(points);
              Alert.alert('Success', 'Your redemption request has been submitted.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch {
              Alert.alert('Error', 'Redemption failed. Please try again.');
            }
          },
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="Redeem Points" showBack />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Available to redeem</Text>
          <Text style={styles.summaryPoints}>{rewards.redeemable_points.toLocaleString()} pts</Text>
          <Text style={styles.summaryMin}>Minimum redemption: 500 points</Text>
        </Card>

        <Card>
          <Text style={styles.payoutLabel}>Payout to</Text>
          <Text style={styles.payoutBank}>{payoutAccount.bank_name}</Text>
          <Text style={styles.payoutAccount}>****{payoutAccount.account_number.slice(-4)}</Text>
        </Card>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Points to redeem</Text>
          <TextInput
            style={styles.input}
            value={pointsInput}
            onChangeText={setPointsInput}
            keyboardType="number-pad"
            placeholder="e.g. 500"
            placeholderTextColor={Colors.textTertiary}
            maxLength={10}
          />
          {pointsInput !== '' && !isValid && (
            <Text style={styles.inputError}>
              {points < 500 ? 'Minimum is 500 points' : `Maximum is ${rewards.redeemable_points.toLocaleString()} points`}
            </Text>
          )}
        </View>

        <Button
          label={points > 0 ? `Redeem ${points.toLocaleString()} points` : 'Enter amount to redeem'}
          onPress={handleRedeem}
          loading={redeem.isPending}
          disabled={!isValid}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  summaryCard: { alignItems: 'center', paddingVertical: Spacing.xl },
  summaryLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
  summaryPoints: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.text },
  summaryMin: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: Spacing.sm },
  payoutLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.xs },
  payoutBank: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text },
  payoutAccount: { fontSize: FontSize.md, color: Colors.textSecondary },
  inputSection: {},
  inputLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text, marginBottom: Spacing.sm },
  input: {
    fontSize: FontSize.xl,
    color: Colors.text,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
    fontWeight: FontWeight.bold,
  },
  inputError: { fontSize: FontSize.xs, color: Colors.error, marginTop: Spacing.xs, textAlign: 'center' },
  footer: { padding: Spacing.lg },
});
