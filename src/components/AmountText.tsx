import React from 'react';
import { Text, TextStyle } from 'react-native';
import { Colors, FontSize, FontWeight } from '@/src/constants/theme';

interface AmountTextProps {
  amount: number;
  currency?: string;
  style?: TextStyle;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES = {
  sm: FontSize.sm,
  md: FontSize.md,
  lg: FontSize.xl,
  xl: FontSize.xxl,
};

export function AmountText({ amount, currency = '₦', style, size = 'md' }: AmountTextProps) {
  const formatted = amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Text
      style={[
        {
          fontSize: SIZES[size],
          fontWeight: FontWeight.bold,
          color: Colors.text,
        },
        style,
      ]}
    >
      {currency}{formatted}
    </Text>
  );
}
