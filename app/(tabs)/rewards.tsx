import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRewards } from '@/src/hooks/use-rewards';
import { Card } from '@/src/components/Card';
import { EmptyState } from '@/src/components/EmptyState';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { Button } from '@/src/components/Button';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/constants/theme';

export default function RewardsScreen() {
  const router = useRouter();
  const { data: rewards, isLoading } = useRewards();

  if (isLoading) return <LoadingSpinner />;

  if (!rewards) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerBar}>
          <Text style={styles.screenTitle}>Rewards</Text>
        </View>
        <EmptyState icon="⭐" title="No rewards data" description="Start tracking transactions to earn points" />
      </SafeAreaView>
    );
  }

  const canRedeem = rewards.redeemable_points >= 500;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>Rewards</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Points Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.totalLabel}>Total Points</Text>
          <Text style={styles.totalPoints}>{rewards.total_points.toLocaleString()}</Text>
          <View style={styles.pointsRow}>
            <View style={styles.pointsItem}>
              <Text style={styles.pointsValue}>{rewards.redeemable_points.toLocaleString()}</Text>
              <Text style={styles.pointsLabel}>Redeemable</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.pointsItem}>
              <Text style={styles.pointsValue}>{rewards.pending_points.toLocaleString()}</Text>
              <Text style={styles.pointsLabel}>Pending</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.pointsItem}>
              <Text style={styles.pointsValue}>{rewards.streak_months}</Text>
              <Text style={styles.pointsLabel}>Month streak</Text>
            </View>
          </View>
        </Card>

        {/* Eligibility */}
        <Card style={styles.eligCard}>
          <Text style={styles.eligTitle}>Eligibility</Text>
          <View style={styles.eligRow}>
            <Text style={styles.eligIcon}>{rewards.eligible_for_rewards ? '✓' : '✗'}</Text>
            <Text style={styles.eligText}>
              {rewards.eligible_for_rewards ? 'Eligible for redemption' : 'Not yet eligible'}
            </Text>
          </View>
          {!rewards.eligible_for_rewards && (
            <Text style={styles.eligHint}>You need at least 500 redeemable points and a qualifying streak.</Text>
          )}
        </Card>

        {/* Redeem Button */}
        <View style={styles.redeemSection}>
          <Button
            label={canRedeem ? `Redeem ${rewards.redeemable_points} pts` : 'Need 500+ points to redeem'}
            onPress={() => router.push('/rewards/redeem')}
            disabled={!canRedeem}
          />
        </View>

        {/* History */}
        {rewards.history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Monthly History</Text>
            {rewards.history.map((month) => (
              <View key={month.month} style={styles.historyRow}>
                <View>
                  <Text style={styles.historyMonth}>
                    {new Date(month.month + '-01').toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })}
                  </Text>
                  <Text style={styles.historySpend}>Spent: ₦{month.total_spent.toLocaleString()}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyPoints}>+{month.points_earned}</Text>
                  <Text style={[styles.historyBudget, { color: month.budget_met ? Colors.success : Colors.error }]}>
                    {month.budget_met ? 'Budget met' : 'Over budget'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  headerBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  screenTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  summaryCard: { alignItems: 'center', paddingVertical: Spacing.xl },
  totalLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs },
  totalPoints: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.lg },
  pointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  pointsItem: { alignItems: 'center', flex: 1 },
  pointsValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  pointsLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  divider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
  eligCard: {},
  eligTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.sm },
  eligRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  eligIcon: { fontSize: FontSize.lg, color: Colors.text },
  eligText: { fontSize: FontSize.md, color: Colors.text },
  eligHint: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: Spacing.sm },
  redeemSection: {},
  historySection: {},
  historyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.sm },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  historyMonth: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text },
  historySpend: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  historyRight: { alignItems: 'flex-end' },
  historyPoints: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  historyBudget: { fontSize: FontSize.xs, marginTop: 2 },
});
