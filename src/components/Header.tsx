import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing } from '@/src/constants/theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export function Header({ title, showBack = false, right }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.right}>{right ?? null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  left: { width: 44, alignItems: 'flex-start' },
  right: { width: 44, alignItems: 'flex-end' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  backBtn: { padding: Spacing.xs },
  backText: { fontSize: FontSize.xl, color: Colors.text, lineHeight: 28 },
});
