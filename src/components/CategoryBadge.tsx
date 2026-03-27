import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Radius, Spacing, FontWeight } from '@/src/constants/theme';

interface CategoryBadgeProps {
  name: string;
}

export function CategoryBadge({ name }: CategoryBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.label}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
});
