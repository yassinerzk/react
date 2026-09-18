import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useAppFonts } from '../src/fonts';
import { Toaster } from '../src/components/ui';
import { ui } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded] = useAppFonts();
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsLoaded]);
  if (!fontsLoaded) return null;
  return (
    <View style={{ flex: 1, backgroundColor: ui.bg }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: ui.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="editor"
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
      </Stack>
      <Toaster />
    </View>
  );
}
