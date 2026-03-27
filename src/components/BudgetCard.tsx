import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BudgetSummary } from '@/src/api/budgets';
import { AmountText } from './AmountText';
import { Colors, FontSize, Radius, Spacing, FontWeight } from '@/src/constants/theme';

interface BudgetCardProps {
  budget: BudgetSummary;
  onPress?: () => void;
}

export function BudgetCard({ budget, onPress }: BudgetCardProps) {
  const progress = budget.total_budgeted > 0
    ? Math.min(budget.total_spent / budget.total_budgeted, 1)
    : 0;
  const isOver = budget.total_spent > budget.total_budgeted;
  const [year, month] = budget.month.split('-');
  const label = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-NG', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.month}>{label}</Text>
        <AmountText amount={budget.total_spent} size="sm" />
      </View>
      <Text style={styles.sub}>of <Text style={styles.budget}>₦{budget.total_budgeted.toLocaleString()}</Text> budgeted</Text>
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${progress * 100}%`, backgroundColor: isOver ? Colors.error : Colors.primary }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  month: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  sub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginBottom: Spacing.sm },
  budget: { fontWeight: FontWeight.semibold, color: Colors.text },
  track: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  bar: {
    height: 4,
    borderRadius: Radius.full,
  },
});
