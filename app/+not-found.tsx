import { useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@/src/components/Button';
import { Colors, FontSize, FontWeight, Spacing } from '@/src/constants/theme';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>404</Text>
      <Text style={styles.sub}>Page not found</Text>
      <Button label="Go Home" onPress={() => router.replace('/(tabs)')} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background, padding: Spacing.xl },
  title: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.text },
  sub: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.xl },
  btn: { width: 200 },
});
