import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';

import { useTransactions, useDeleteTransaction } from '@/src/hooks/use-transactions';
import { Transaction } from '@/src/api/transactions';
import { TransactionRow } from '@/src/components/TransactionRow';
import { EmptyState } from '@/src/components/EmptyState';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/constants/theme';

const STATUS_FILTERS = ['All', 'PENDING', 'VERIFIED', 'DUPLICATE', 'SELF_TRANSFER'];

function SwipeableRow({ transaction, onDelete, onPress }: {
  transaction: Transaction;
  onDelete: () => void;
  onPress: () => void;
}) {
  const renderRight = () => (
    <TouchableOpacity style={styles.deleteAction} onPress={onDelete}>
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRight} friction={2} overshootRight={false}>
      <TransactionRow transaction={transaction} onPress={onPress} />
    </Swipeable>
  );
}

export default function TransactionsScreen() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('All');
  const deleteMutation = useDeleteTransaction();

  const filters = statusFilter !== 'All' ? { status: statusFilter } : {};
  const { data, isLoading, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useTransactions(filters);

  const allTransactions = data?.pages.flatMap((p) => p.data) ?? [];

  function handleDelete(tx: Transaction) {
    Alert.alert(
      'Delete Transaction',
      `Delete transaction of ₦${tx.amount.toLocaleString()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(tx.id),
        },
      ]
    );
  }

  const renderItem = useCallback(({ item }: { item: Transaction }) => (
    <SwipeableRow
      transaction={item}
      onPress={() => router.push(`/transaction/${item.id}`)}
      onDelete={() => handleDelete(item)}
    />
  ), [router]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>Transactions</Text>
        <TouchableOpacity onPress={() => router.push('/transaction/new')} style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Status Filter */}
      <View style={styles.filterScroll}>
        {STATUS_FILTERS.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setStatusFilter(s)}
            style={[styles.filterChip, statusFilter === s && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, statusFilter === s && styles.filterChipTextActive]}>
              {s}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={allTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={Colors.primary} />}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <LoadingSpinner /> : null}
        ListEmptyComponent={
          <EmptyState icon="📋" title="No transactions" description="Transactions will appear here once you add them" />
        }
      />
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
  filterScroll: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  filterChipTextActive: { color: Colors.white },
  deleteAction: {
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
});
