import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { getTransactionById, deleteTransaction, updateTransaction, LocalTransaction } from '@/src/db/local-db';
import { transactionsApi } from '@/src/api/transactions';
import { useCategories } from '@/src/hooks/use-categories';
import { Header } from '@/src/components/Header';
import { Card } from '@/src/components/Card';
import { AmountText } from '@/src/components/AmountText';
import { StatusBadge } from '@/src/components/StatusBadge';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { Button } from '@/src/components/Button';
import { Colors, FontSize, FontWeight, Spacing } from '@/src/constants/theme';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: categories } = useCategories();
  const [tx, setTx] = useState<LocalTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTransactionById(id).then((t) => {
      setTx(t);
      setSelectedCategory(t?.category_id);
      setLoading(false);
    });
  }, [id]);

  async function handleSave() {
    if (!tx) return;
    setSaving(true);
    try {
      await updateTransaction(tx.id, { category_id: selectedCategory });
      const updated = await getTransactionById(tx.id);
      setTx(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!tx) return;
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await transactionsApi.delete(tx.id);
          } catch {}
          await deleteTransaction(tx.id);
          router.back();
        },
      },
    ]);
  }

  if (loading) return <LoadingSpinner />;
  if (!tx) return (
    <View style={styles.flex}>
      <Header title="Transaction" showBack />
      <View style={styles.center}><Text style={styles.notFound}>Transaction not found</Text></View>
    </View>
  );

  const date = new Date(tx.timestamp);

  return (
    <View style={styles.flex}>
      <Header
        title="Transaction"
        showBack
        right={
          <TouchableOpacity onPress={() => setEditing((e) => !e)}>
            <Text style={styles.editBtn}>{editing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.amountCard}>
          <AmountText amount={tx.amount} size="xl" />
          <Text style={styles.amountBank}>{tx.bank_source}</Text>
          <StatusBadge status={tx.status} />
        </Card>

        <Card style={styles.detailsCard}>
          <InfoRow label="Merchant" value={tx.merchant_raw ?? '—'} />
          <InfoRow label="Date" value={date.toLocaleDateString('en-NG', { dateStyle: 'full' })} />
          <InfoRow label="Time" value={date.toLocaleTimeString('en-NG', { timeStyle: 'short' })} />
          <InfoRow label="Source" value={tx.trigger_type} />
          <InfoRow label="Status" value={tx.status} />
          {tx.sync_result ? <InfoRow label="Sync" value={tx.sync_result} /> : null}
        </Card>

        {editing && categories && (
          <Card style={styles.editCard}>
            <Text style={styles.editLabel}>Category</Text>
            <View style={styles.chipGroup}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(selectedCategory === cat.id ? undefined : cat.id)}
                  style={[styles.chip, selectedCategory === cat.id && styles.chipActive]}
                >
                  <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.editActions}>
              <Button label="Save Changes" onPress={handleSave} loading={saving} />
            </View>
          </Card>
        )}

        <View style={styles.dangerSection}>
          <Button label="Delete Transaction" variant="danger" onPress={handleDelete} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: FontSize.md, color: Colors.textSecondary },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl },
  amountCard: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  amountBank: { fontSize: FontSize.sm, color: Colors.textSecondary },
  detailsCard: {},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  infoValue: { fontSize: FontSize.sm, color: Colors.text, fontWeight: FontWeight.medium, textAlign: 'right', flex: 1, paddingLeft: Spacing.md },
  editCard: {},
  editLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text, marginBottom: Spacing.sm },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 100,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  chipTextActive: { color: Colors.white },
  editActions: { marginTop: Spacing.md },
  editBtn: { fontSize: FontSize.sm, color: Colors.textSecondary },
  dangerSection: {},
});
