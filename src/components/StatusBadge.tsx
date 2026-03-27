import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Radius, Spacing, FontWeight } from '@/src/constants/theme';

type Status = 'PENDING' | 'VERIFIED' | 'DUPLICATE' | 'SELF_TRANSFER';

const STATUS_CONFIG: Record<Status, { label: string; bg: string; color: string }> = {
  PENDING: { label: 'Pending', bg: '#FFF3E0', color: Colors.warning },
  VERIFIED: { label: 'Verified', bg: '#E8F5E9', color: Colors.success },
  DUPLICATE: { label: 'Duplicate', bg: '#F5F5F5', color: Colors.textSecondary },
  SELF_TRANSFER: { label: 'Self Transfer', bg: '#F5F5F5', color: Colors.textSecondary },
};

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: Radius.full,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
