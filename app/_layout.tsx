import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { OfflineBanner } from '@/src/components/OfflineBanner';
import { Colors } from '@/src/constants/theme';
import { initDB } from '@/src/db/local-db';
import { useAuthStore } from '@/src/store/auth-store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, isLoading, hasProfile, loadSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initDB().catch(console.error);

    console.log('here', session)

    if (!session) loadSession();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';


    if (!session) {
      if (!inAuthGroup) router.replace('/(auth)/login');
    } else if (!hasProfile) {
      if (segments[1] !== 'onboarding') router.replace('/(auth)/onboarding');
    } else {
      if (inAuthGroup) router.replace('/(tabs)');
    }
  }, [session, isLoading, hasProfile, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <AuthGuard>
          <View style={styles.root}>
            <OfflineBanner />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="transaction/new" options={{ presentation: 'modal' }} />
              <Stack.Screen name="transaction/[id]" />
              <Stack.Screen name="budget/new" options={{ presentation: 'modal' }} />
              <Stack.Screen name="budget/[month]" />
              <Stack.Screen name="rewards/redeem" options={{ presentation: 'modal' }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </View>
        </AuthGuard>
        <StatusBar style="dark" />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
});
