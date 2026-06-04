import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/src/constants/theme';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const SHEET_HEIGHT = 280;

interface QuickAddSheetProps {
  visible: boolean;
  onClose: () => void;
}

function parseOCRText(text: string): { amount?: string; merchant?: string } {
  const amountMatch = text.match(/(?:₦|NGN|N)\s?([\d,]+(?:\.\d{1,2})?)/i)
    ?? text.match(/\b([\d,]{3,}(?:\.\d{1,2})?)\b/);
  const amount = amountMatch ? amountMatch[1].replace(/,/g, '') : undefined;

  const merchantMatch = text.match(/(?:at|to|from|merchant[:\s]+)([A-Z][A-Z0-9\s&]{2,30})/i);
  const merchant = merchantMatch ? merchantMatch[1].trim() : undefined;

  return { amount, merchant };
}

export function QuickAddSheet({ visible, onClose }: QuickAddSheetProps) {
  const router = useRouter();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [scanning, setScanning] = React.useState(false);

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
    Alert.alert('Coming Soon', 'SMS capture will be available in the next update.');
    onClose();
  }

  async function handleScreenshot() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library to scan screenshots.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) return;

    onClose();
    setScanning(true);
    try {
      const recognized = await TextRecognition.recognize(result.assets[0].uri);
      const { amount, merchant } = parseOCRText(recognized.text);
      router.push({
        pathname: '/transaction/new',
        params: { amount, merchant_raw: merchant, trigger_type: 'OCR' },
      });
    } catch {
      Alert.alert('OCR Failed', 'Could not read text from the image. Try a clearer screenshot.');
    } finally {
      setScanning(false);
    }
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

        <TouchableOpacity style={styles.option} onPress={handleScreenshot} activeOpacity={0.7} disabled={scanning}>
          <View style={styles.optionIcon}>
            {scanning ? <ActivityIndicator size="small" color={Colors.primary} /> : <Text style={styles.emoji}>📷</Text>}
          </View>
          <View>
            <Text style={styles.optionLabel}>Screenshot OCR</Text>
            <Text style={styles.optionSub}>{scanning ? 'Scanning...' : 'Extract from payment screenshot'}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
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
    width: 36, height: 4, borderRadius: Radius.full,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: Spacing.sm, marginBottom: Spacing.md,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.md },
  option: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  optionIcon: {
    width: 44, height: 44, borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 20 },
  optionLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.text },
  optionSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
});
