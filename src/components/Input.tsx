import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Colors, FontSize, Radius, Spacing, FontWeight } from '@/src/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  secureToggle?: boolean;
}

export function Input({ label, error, containerStyle, secureToggle, secureTextEntry, ...props }: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={Colors.textTertiary}
          secureTextEntry={secureToggle ? !showPassword : secureTextEntry}
          autoCapitalize="none"
          {...props}
        />
        {secureToggle ? (
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton}>
            <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.md },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  inputError: { borderColor: Colors.error },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.md,
    minHeight: 52,
  },
  eyeButton: { padding: Spacing.sm },
  eyeText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  error: { fontSize: FontSize.xs, color: Colors.error, marginTop: Spacing.xs },
});
