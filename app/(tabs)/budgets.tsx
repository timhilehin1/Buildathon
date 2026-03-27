import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBudgets } from '@/src/hooks/use-budgets';
import { BudgetCard } from '@/src/components/BudgetCard';
import { EmptyState } from '@/src/components/EmptyState';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/constants/theme';

export default function BudgetsScreen() {
  const router = useRouter();
  const { data: budgets, isLoading, refetch } = useBudgets();

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>Budgets</Text>
        <TouchableOpacity onPress={() => router.push('/budget/new')} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={budgets ?? []}
        keyExtractor={(item) => item.month}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <BudgetCard
            budget={item}
            onPress={() => router.push(`/budget/${item.month}`)}
          />
        )}
        refreshing={false}
        onRefresh={refetch}
        ListEmptyComponent={
          <EmptyState
            icon="💳"
            title="No budgets yet"
            description="Create a budget to track your monthly spending"
          />
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/budget/new')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  screenTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  addBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
  },
  addBtnText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  list: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
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
