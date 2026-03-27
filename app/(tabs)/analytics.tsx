import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-gifted-charts';

import { useCategoryAnalytics, useBankAnalytics } from '@/src/hooks/use-analytics';
import { EmptyState } from '@/src/components/EmptyState';
import { LoadingSpinner } from '@/src/components/LoadingSpinner';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/constants/theme';

type Tab = 'categories' | 'banks';

function getMonthRange(offset = 0): { from: string; to: string; label: string } {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const to = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${lastDay}`;
  const label = d.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
  return { from, to, label };
}

const CHART_COLORS = ['#000', '#444', '#666', '#888', '#AAA', '#CCC', '#DDD', '#EEE'];

export default function AnalyticsScreen() {
  const [tab, setTab] = useState<Tab>('categories');
  const [monthOffset, setMonthOffset] = useState(0);
  const { from, to, label } = getMonthRange(monthOffset);

  const { data: catData, isLoading: catLoading } = useCategoryAnalytics(from, to);
  const { data: bankData, isLoading: bankLoading } = useBankAnalytics(from, to);

  const isLoading = tab === 'categories' ? catLoading : bankLoading;

  const items = tab === 'categories'
    ? (catData ?? []).map((d, i) => ({
        name: d.category_name,
        total: d.total,
        percentage: d.percentage,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }))
    : (bankData ?? []).map((d, i) => ({
        name: d.bank_source,
        total: d.total,
        percentage: d.percentage,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));

  const pieData = items.map((item) => ({ value: item.total, color: item.color }));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <Text style={styles.screenTitle}>Analytics</Text>
      </View>

      {/* Month Picker */}
      <View style={styles.monthPicker}>
        <TouchableOpacity onPress={() => setMonthOffset((o) => o - 1)} style={styles.arrow}>
          <Text style={styles.arrowText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{label}</Text>
        <TouchableOpacity
          onPress={() => setMonthOffset((o) => Math.min(0, o + 1))}
          style={styles.arrow}
          disabled={monthOffset === 0}
        >
          <Text style={[styles.arrowText, monthOffset === 0 && styles.arrowDisabled]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Toggle */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setTab('categories')}
          style={[styles.tabBtn, tab === 'categories' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, tab === 'categories' && styles.tabBtnTextActive]}>Categories</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('banks')}
          style={[styles.tabBtn, tab === 'banks' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, tab === 'banks' && styles.tabBtnTextActive]}>Banks</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? <LoadingSpinner /> : (
        <ScrollView contentContainerStyle={styles.content}>
          {items.length === 0 ? (
            <EmptyState icon="📊" title="No data" description="No verified transactions found for this period" />
          ) : (
            <>
              <View style={styles.chartContainer}>
                <PieChart
                  data={pieData}
                  donut
                  radius={100}
                  innerRadius={60}
                  innerCircleColor={Colors.background}
                  centerLabelComponent={() => (
                    <View style={styles.chartCenter}>
                      <Text style={styles.chartCenterText}>
                        ₦{items.reduce((s, i) => s + i.total, 0).toLocaleString('en-NG', { notation: 'compact' })}
                      </Text>
                      <Text style={styles.chartCenterSub}>total</Text>
                    </View>
                  )}
                />
              </View>

              {items.map((item) => (
                <View key={item.name} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.legendPct}>{item.percentage.toFixed(1)}%</Text>
                  <Text style={styles.legendAmt}>₦{item.total.toLocaleString()}</Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
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
  monthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  arrow: { padding: Spacing.sm },
  arrowText: { fontSize: FontSize.xxl, color: Colors.text },
  arrowDisabled: { color: Colors.textTertiary },
  monthLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 4,
  },
  tabBtn: { flex: 1, paddingVertical: Spacing.sm, alignItems: 'center', borderRadius: Radius.sm },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  tabBtnTextActive: { color: Colors.white },
  content: { paddingBottom: Spacing.xxl },
  chartContainer: { alignItems: 'center', paddingVertical: Spacing.xl },
  chartCenter: { alignItems: 'center' },
  chartCenterText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.text },
  chartCenterSub: { fontSize: FontSize.xs, color: Colors.textSecondary },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendName: { flex: 1, fontSize: FontSize.sm, color: Colors.text },
  legendPct: { fontSize: FontSize.sm, color: Colors.textSecondary, width: 48, textAlign: 'right' },
  legendAmt: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text, width: 100, textAlign: 'right' },
});
