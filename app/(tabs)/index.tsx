import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '@/src/store/auth-store';
import { useRecentTransactions } from '@/src/hooks/use-transactions';
import { useBudgets } from '@/src/hooks/use-budgets';
import { useRewards } from '@/src/hooks/use-rewards';
import { useProfile } from '@/src/hooks/use-profile';
import { TransactionRow } from '@/src/components/TransactionRow';
import { Card } from '@/src/components/Card';
import { AmountText } from '@/src/components/AmountText';
import { QuickAddSheet } from '@/src/components/QuickAddSheet';
import { EmptyState } from '@/src/components/EmptyState';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/constants/theme';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data: recentTxs, refetch: refetchTxs } = useRecentTransactions();
  const { data: budgets } = useBudgets();
  const { data: rewards } = useRewards();
  const { data: profile } = useProfile();

  const currentMonth = getCurrentMonth();
  const currentBudget = budgets?.find((b) => b.month === currentMonth);
  const displayName = profile?.first_name ?? session?.email?.split('@')[0] ?? 'there';

  async function onRefresh() {
    setRefreshing(true);
    await refetchTxs();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{displayName}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName[0]?.toUpperCase() ?? '?'}</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.spendCard}>
          <Text style={styles.cardLabel}>This month's spending</Text>
          <AmountText amount={recentTxs?.reduce((s, t) => s + t.amount, 0) ?? 0} size="xl" />
          {currentBudget ? (
            <View style={styles.budgetInfo}>
              <Text style={styles.budgetText}>
                of <Text style={styles.budgetAmount}>₦{currentBudget.total_budgeted.toLocaleString()}</Text> budgeted
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min((currentBudget.total_spent / currentBudget.total_budgeted) * 100, 100)}%`,
                      backgroundColor: currentBudget.total_spent > currentBudget.total_budgeted ? Colors.error : Colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => router.push('/budget/new')} style={styles.setBudgetBtn}>
              <Text style={styles.setBudgetText}>+ Set a budget</Text>
            </TouchableOpacity>
          )}
        </Card>

        {rewards ? (
          <TouchableOpacity onPress={() => router.push('/(tabs)/rewards')} activeOpacity={0.7}>
            <Card style={styles.rewardsCard}>
              <View style={styles.rewardsRow}>
                <Text style={styles.rewardsLabel}>Rewards</Text>
                <Text style={styles.rewardsPoints}>{rewards.total_points.toLocaleString()} pts</Text>
              </View>
              <Text style={styles.rewardsSub}>
                {rewards.streak_months} month streak · {rewards.redeemable_points} redeemable
              </Text>
            </Card>
          </TouchableOpacity>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {recentTxs && recentTxs.length > 0 ? (
            <View style={styles.txList}>
              {recentTxs.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  transaction={tx}
                  onPress={() => router.push(`/transaction/${tx.id}`)}
                />
              ))}
            </View>
          ) : (
            <EmptyState icon="💸" title="No transactions yet" description="Tap + to add your first transaction" />
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setQuickAddVisible(true)} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <QuickAddSheet visible={quickAddVisible} onClose={() => setQuickAddVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  greeting: { fontSize: FontSize.sm, color: Colors.textSecondary },
  name: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontSize: FontSize.md, fontWeight: FontWeight.bold },
  spendCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md },
  cardLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.xs },
  budgetInfo: { marginTop: Spacing.sm },
  budgetText: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.xs },
  budgetAmount: { fontWeight: FontWeight.semibold, color: Colors.text },
  progressTrack: { height: 4, backgroundColor: Colors.border, borderRadius: Radius.full, overflow: 'hidden' },
  progressBar: { height: 4, borderRadius: Radius.full },
  setBudgetBtn: { marginTop: Spacing.sm },
  setBudgetText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  rewardsCard: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md },
  rewardsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rewardsLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  rewardsPoints: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  rewardsSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: Spacing.xs },
  section: { marginBottom: Spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  seeAll: { fontSize: FontSize.sm, color: Colors.textSecondary },
  txList: { borderTopWidth: 1, borderTopColor: Colors.border },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  fabIcon: { color: Colors.white, fontSize: 28, lineHeight: 32, fontWeight: '300' },
});
