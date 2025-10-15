import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { AccountsProvider } from "@/contexts/AccountsContext"; // 👈 import provider
import { AppSettingsProvider } from "@/contexts/AppSettingsContext";
import { ThemeProvider as CustomThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LockScreen from "@/components/LockScreen";
import PrivacyScreen from "@/components/PrivacyScreen";

function AppContent() {
  const { isLocked, isHiddenForAppSwitch } = useAuth();

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      {isLocked && <LockScreen />}
      <PrivacyScreen isVisible={isHiddenForAppSwitch && !isLocked} />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <AccountsProvider>
        <AppSettingsProvider>
          <AuthProvider>
            <CustomThemeProvider>
              <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              >
                <AppContent />
              </ThemeProvider>
            </CustomThemeProvider>
          </AuthProvider>
        </AppSettingsProvider>
      </AccountsProvider>
    </SafeAreaProvider>
  );
}
