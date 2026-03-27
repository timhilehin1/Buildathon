import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Colors, FontSize, Spacing } from '@/src/constants/theme';
import { flushQueue } from '@/src/services/sync-queue';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable);
      setIsOffline(offline);
      if (!offline) {
        flushQueue().catch(() => {});
      }
    });

    const appStateSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        flushQueue().catch(() => {});
      }
    });

    return () => {
      unsubscribe();
      appStateSub.remove();
    };
  }, []);

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>No internet connection — changes will sync when back online</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.text,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  text: {
    color: Colors.white,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
});
