import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { StoreProvider, useStore } from '@/store/useStore';
import NotificationToast from '@/components/notification-toast';

SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { user, isHydrated } = useStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;

    const inAuth = segments[0] === 'auth';

    if (!user && !inAuth) {
      router.replace('/auth' as any);
    } else if (user && inAuth) {
      if (user.role === 'admin') router.replace('/admin' as any);
      else if (user.role === 'rider') router.replace('/rider' as any);
      else router.replace('/' as any);
    }
  }, [user, isHydrated, segments, router]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <StoreProvider>
          <AuthGate />
          <AnimatedSplashOverlay />
          <NotificationToast />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" options={{ animation: 'fade' }} />
            <Stack.Screen name="admin" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="rider" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="cart" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="order-tracking" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="profile" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="hamper-builder" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="product-detail" options={{ animation: 'slide_from_bottom' }} />
          </Stack>
        </StoreProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
