import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Transaction } from '@/src/api/transactions';
import { AmountText } from './AmountText';
import { StatusBadge } from './StatusBadge';
import { Colors, FontSize, Spacing, FontWeight } from '@/src/constants/theme';

interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
}

export function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const date = new Date(transaction.timestamp);
  const dateStr = date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.row}>
      <View style={styles.iconWrapper}>
        <Text style={styles.icon}>₦</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.merchant} numberOfLines={1}>
          {transaction.merchant_raw ?? transaction.bank_source}
        </Text>
        <Text style={styles.meta}>
          {transaction.bank_source} · {dateStr} {timeStr}
        </Text>
      </View>
      <View style={styles.right}>
        <AmountText amount={transaction.amount} size="sm" />
        <StatusBadge status={transaction.status} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  icon: { fontSize: FontSize.md, color: Colors.textSecondary },
  info: { flex: 1, marginRight: Spacing.sm },
  merchant: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  right: { alignItems: 'flex-end', gap: 4 },
});
