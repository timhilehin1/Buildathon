import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';

import { useCreateBudget } from '@/src/hooks/use-budgets';
import { useCategories } from '@/src/hooks/use-categories';
import { Header } from '@/src/components/Header';
import { Button } from '@/src/components/Button';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/constants/theme';

function getDefaultMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

interface BudgetLine {
  category_id: number;
  category_name: string;
  amount: string;
}

export default function NewBudgetScreen() {
  const router = useRouter();
  const { data: categories } = useCategories();
  const createBudget = useCreateBudget();
  const [month] = useState(getDefaultMonth());
  const [lines, setLines] = useState<BudgetLine[]>([]);

  function addCategory(id: number, name: string) {
    if (lines.some((l) => l.category_id === id)) return;
    setLines((prev) => [...prev, { category_id: id, category_name: name, amount: '' }]);
  }

  function removeCategory(id: number) {
    setLines((prev) => prev.filter((l) => l.category_id !== id));
  }

  function updateAmount(id: number, amount: string) {
    setLines((prev) => prev.map((l) => l.category_id === id ? { ...l, amount } : l));
  }

  async function handleCreate() {
    const validLines = lines.filter((l) => l.amount && parseFloat(l.amount) > 0);
    if (validLines.length === 0) {
      Alert.alert('No items', 'Add at least one category with an amount.');
      return;
    }
    try {
      await createBudget.mutateAsync({
        month,
        items: validLines.map((l) => ({ category_id: l.category_id, amount: parseFloat(l.amount) })),
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to create budget. Please try again.');
    }
  }

  const [year, monthNum] = month.split('-');
  const monthLabel = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="New Budget" showBack />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Text style={styles.sub}>Select categories and set spending limits</Text>

        {/* Category picker */}
        {categories && (
          <View style={styles.chipGroup}>
            {categories.map((cat) => {
              const selected = lines.some((l) => l.category_id === cat.id);
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => selected ? removeCategory(cat.id) : addCategory(cat.id, cat.name)}
                  style={[styles.chip, selected && styles.chipActive]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Amount inputs */}
        {lines.map((line) => (
          <View key={line.category_id} style={styles.lineItem}>
            <Text style={styles.lineName}>{line.category_name}</Text>
            <TextInput
              style={styles.lineInput}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={line.amount}
              onChangeText={(v) => updateAmount(line.category_id, v)}
              placeholderTextColor={Colors.textTertiary}
            />
            <TouchableOpacity onPress={() => removeCategory(line.category_id)} style={styles.removeBtn}>
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.footer}>
          <Button
            label="Create Budget"
            onPress={handleCreate}
            loading={createBudget.isPending}
            disabled={lines.length === 0}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  monthLabel: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.xs },
  sub: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.lg },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  chipTextActive: { color: Colors.white },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  lineName: { flex: 1, fontSize: FontSize.md, color: Colors.text },
  lineInput: {
    width: 100,
    fontSize: FontSize.md,
    color: Colors.text,
    textAlign: 'right',
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removeBtn: { padding: Spacing.xs },
  removeText: { fontSize: FontSize.md, color: Colors.textTertiary },
  footer: { marginTop: Spacing.xl },
});
