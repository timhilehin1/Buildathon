import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Radius, Spacing, FontWeight } from '@/src/constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 280;

interface QuickAddSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function QuickAddSheet({ visible, onClose }: QuickAddSheetProps) {
  const router = useRouter();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : SHEET_HEIGHT,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
  }, [visible]);

  function handleManual() {
    onClose();
    router.push('/transaction/new');
  }

  function handleSMS() {
    if (Platform.OS !== 'android') {
      Alert.alert('Android Only', 'SMS capture is only available on Android devices.');
      return;
    }
    Alert.alert(
      'Dev Build Required',
      'SMS capture requires a dev build. Run `expo run:android` to enable this feature.',
    );
    onClose();
  }

  function handleScreenshot() {
    Alert.alert(
      'Dev Build Required',
      'Screenshot OCR requires a dev build with ML Kit. Run `expo run:android` or `expo run:ios` to enable.',
    );
    onClose();
  }

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Add Transaction</Text>

        <TouchableOpacity style={styles.option} onPress={handleManual} activeOpacity={0.7}>
          <View style={styles.optionIcon}><Text style={styles.emoji}>✏️</Text></View>
          <View>
            <Text style={styles.optionLabel}>Manual Entry</Text>
            <Text style={styles.optionSub}>Type in transaction details</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleSMS} activeOpacity={0.7}>
          <View style={styles.optionIcon}><Text style={styles.emoji}>💬</Text></View>
          <View>
            <Text style={styles.optionLabel}>Scan SMS</Text>
            <Text style={styles.optionSub}>Parse bank SMS alert (Android)</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={handleScreenshot} activeOpacity={0.7}>
          <View style={styles.optionIcon}><Text style={styles.emoji}>📷</Text></View>
          <View>
            <Text style={styles.optionLabel}>Screenshot OCR</Text>
            <Text style={styles.optionSub}>Extract from payment screenshot</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Colors.background,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 20 },
  optionLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text },
  optionSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
});
