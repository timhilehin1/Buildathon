import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { insertTransaction } from '@/src/db/local-db';
import { flushQueue } from '@/src/services/sync-queue';
import { useCategories } from '@/src/hooks/use-categories';
import { Header } from '@/src/components/Header';
import { Input } from '@/src/components/Input';
import { Button } from '@/src/components/Button';
import { Colors, FontSize, FontWeight, Spacing } from '@/src/constants/theme';

const BANKS = ['GTBank', 'Access Bank', 'Zenith Bank', 'UBA', 'First Bank', 'Opay', 'Kuda', 'Palmpay', 'Moniepoint', 'Other'];

const schema = z.object({
  amount: z.string().min(1, 'Required').refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Must be a positive number'),
  merchant_raw: z.string().optional(),
  bank_source: z.string().min(1, 'Required'),
  category_id: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewTransactionScreen() {
  const router = useRouter();
  const { data: categories } = useCategories();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { bank_source: BANKS[0] },
  });

  async function onSubmit(data: FormData) {
    try {
      await insertTransaction({
        amount: parseFloat(data.amount),
        merchant_raw: data.merchant_raw,
        bank_source: data.bank_source,
        category_id: data.category_id ? parseInt(data.category_id) : undefined,
        trigger_type: 'MANUAL',
        status: 'PENDING',
        timestamp: new Date().toISOString(),
      });
      flushQueue().catch(() => {});
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header title="New Transaction" showBack />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Amount (₦)"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.amount?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="merchant_raw"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label="Merchant / Payee (optional)"
              placeholder="SHOPRITE IKEJA"
              autoCapitalize="characters"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Bank</Text>
          <Controller
            control={control}
            name="bank_source"
            render={({ field: { onChange, value } }) => (
              <View style={styles.chipGroup}>
                {BANKS.map((b) => (
                  <Button
                    key={b}
                    label={b}
                    variant={value === b ? 'primary' : 'secondary'}
                    onPress={() => onChange(b)}
                    fullWidth={false}
                    style={styles.chip}
                    textStyle={styles.chipText}
                  />
                ))}
              </View>
            )}
          />
          {errors.bank_source ? <Text style={styles.error}>{errors.bank_source.message}</Text> : null}
        </View>

        {categories && categories.length > 0 && (
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Category (optional)</Text>
            <Controller
              control={control}
              name="category_id"
              render={({ field: { onChange, value } }) => (
                <View style={styles.chipGroup}>
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      label={cat.name}
                      variant={value === String(cat.id) ? 'primary' : 'secondary'}
                      onPress={() => onChange(value === String(cat.id) ? undefined : String(cat.id))}
                      fullWidth={false}
                      style={styles.chip}
                      textStyle={styles.chipText}
                    />
                  ))}
                </View>
              )}
            />
          </View>
        )}

        <View style={styles.footer}>
          <Button label="Save Transaction" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  fieldGroup: { marginBottom: Spacing.md },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, minHeight: 0 },
  chipText: { fontSize: FontSize.sm },
  error: { fontSize: FontSize.xs, color: Colors.error, marginTop: Spacing.xs },
  footer: { marginTop: Spacing.lg },
});
