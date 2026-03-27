import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';

import { useBudgetDetail, useDeleteBudgetItem, useUpdateBudgetItem, useAddBudgetItem } from '@/src/hooks/use-budgets';
import { useCategories } from '@/src/hooks/use-categories';
import { BudgetItem } from '@/src/api/budgets';
import { Header } from '@/src/components/Header';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { EmptyState } from '@/src/components/EmptyState';
import { Button } from '@/src/components/Button';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/constants/theme';

function BudgetItemRow({
  item,
  onDelete,
  onEdit,
}: {
  item: BudgetItem;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const progress = item.amount > 0 ? Math.min(item.spent / item.amount, 1) : 0;
  const isOver = item.spent > item.amount;

  const renderRight = () => (
    <TouchableOpacity style={styles.deleteAction} onPress={onDelete}>
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderRight} friction={2} overshootRight={false}>
      <TouchableOpacity onLongPress={onEdit} style={styles.itemRow} activeOpacity={0.9}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.category_name}</Text>
          <Text style={[styles.itemAmt, isOver && styles.itemAmtOver]}>
            ₦{item.spent.toLocaleString()} / ₦{item.amount.toLocaleString()}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: isOver ? Colors.error : Colors.primary }]} />
        </View>
        <Text style={[styles.remaining, isOver && styles.remainingOver]}>
          {isOver ? `₦${(item.spent - item.amount).toLocaleString()} over` : `₦${item.remaining.toLocaleString()} left`}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );
}

export default function BudgetDetailScreen() {
  const { month } = useLocalSearchParams<{ month: string }>();
  const router = useRouter();
  const { data: budget, isLoading } = useBudgetDetail(month);
  const { data: categories } = useCategories();
  const deleteItem = useDeleteBudgetItem();
  const updateItem = useUpdateBudgetItem();
  const addItem = useAddBudgetItem();

  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState<number | null>(null);
  const [newAmount, setNewAmount] = useState('');

  if (isLoading) return <LoadingSpinner />;
  if (!budget) return (
    <View style={styles.flex}>
      <Header title="Budget" showBack />
      <EmptyState title="Budget not found" />
    </View>
  );

  const [year, monthNum] = month.split('-');
  const monthLabel = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });

  function handleDeleteItem(item: BudgetItem) {
    Alert.alert('Remove Item', `Remove ${item.category_name} from budget?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => deleteItem.mutate({ month, categoryId: item.category_id }),
      },
    ]);
  }

  function handleEditItem(item: BudgetItem) {
    setEditingItem(item);
    setEditAmount(String(item.amount));
  }

  async function handleSaveEdit() {
    if (!editingItem) return;
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;
    await updateItem.mutateAsync({ month, categoryId: editingItem.category_id, amount });
    setEditingItem(null);
  }

  async function handleAddItem() {
    if (!newCategoryId || !newAmount || parseFloat(newAmount) <= 0) return;
    await addItem.mutateAsync({ month, item: { category_id: newCategoryId, amount: parseFloat(newAmount) } });
    setAddingNew(false);
    setNewCategoryId(null);
    setNewAmount('');
  }

  const existingCategoryIds = budget.items.map((i) => i.category_id);
  const availableCategories = categories?.filter((c) => !existingCategoryIds.includes(c.id)) ?? [];

  return (
    <View style={styles.flex}>
      <Header title={monthLabel} showBack />
      <ScrollView contentContainerStyle={styles.content}>
        {budget.items.length === 0 ? (
          <EmptyState icon="💳" title="No budget items" description="Add categories to track your spending" />
        ) : (
          budget.items.map((item) => (
            <BudgetItemRow
              key={item.category_id}
              item={item}
              onDelete={() => handleDeleteItem(item)}
              onEdit={() => handleEditItem(item)}
            />
          ))
        )}

        {/* Edit modal inline */}
        {editingItem ? (
          <View style={styles.editBox}>
            <Text style={styles.editTitle}>Edit: {editingItem.category_name}</Text>
            <TextInput
              style={styles.editInput}
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="decimal-pad"
              placeholder="Amount"
              placeholderTextColor={Colors.textTertiary}
            />
            <View style={styles.editActions}>
              <Button label="Cancel" variant="secondary" onPress={() => setEditingItem(null)} style={styles.half} fullWidth={false} />
              <Button label="Save" onPress={handleSaveEdit} loading={updateItem.isPending} style={styles.half} fullWidth={false} />
            </View>
          </View>
        ) : null}

        {/* Add new item */}
        {addingNew ? (
          <View style={styles.editBox}>
            <Text style={styles.editTitle}>Add Category</Text>
            <View style={styles.chipGroup}>
              {availableCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setNewCategoryId(cat.id)}
                  style={[styles.chip, newCategoryId === cat.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, newCategoryId === cat.id && styles.chipTextActive]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.editInput, styles.mt]}
              value={newAmount}
              onChangeText={setNewAmount}
              keyboardType="decimal-pad"
              placeholder="Amount (₦)"
              placeholderTextColor={Colors.textTertiary}
            />
            <View style={styles.editActions}>
              <Button label="Cancel" variant="secondary" onPress={() => setAddingNew(false)} style={styles.half} fullWidth={false} />
              <Button label="Add" onPress={handleAddItem} loading={addItem.isPending} style={styles.half} fullWidth={false} />
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setAddingNew(true)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Add category</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  itemRow: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.md,
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  itemName: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text },
  itemAmt: { fontSize: FontSize.sm, color: Colors.textSecondary },
  itemAmtOver: { color: Colors.error },
  progressTrack: { height: 4, backgroundColor: Colors.border, borderRadius: Radius.full, overflow: 'hidden', marginBottom: Spacing.xs },
  progressBar: { height: 4, borderRadius: Radius.full },
  remaining: { fontSize: FontSize.xs, color: Colors.textSecondary },
  remainingOver: { color: Colors.error },
  deleteAction: { backgroundColor: Colors.error, justifyContent: 'center', alignItems: 'center', width: 80 },
  deleteText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  editBox: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text, marginBottom: Spacing.sm },
  editInput: {
    fontSize: FontSize.md,
    color: Colors.text,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mt: { marginTop: Spacing.sm },
  editActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  half: { flex: 1 },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },
  addBtn: { marginTop: Spacing.lg, alignItems: 'center', padding: Spacing.md },
  addBtnText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: FontWeight.medium },
});
