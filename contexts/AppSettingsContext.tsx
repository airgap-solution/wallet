import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type RefreshInterval = "5s" | "10s" | "30s" | "1m" | "5m";
export type NumberFormat = "default" | "compact" | "scientific";

interface AppSettingsContextType {
  // Security Settings
  biometricEnabled: boolean;
  autoLockEnabled: boolean;
  autoLockTimeout: number; // in minutes
  hideBalancesOnAppSwitch: boolean;

  // Display Settings
  showTestnetCoins: boolean;
  hideSmallBalances: boolean;
  smallBalanceThreshold: number;
  numberFormat: NumberFormat;
  showPercentageChanges: boolean;

  // Data & Sync Settings
  refreshInterval: RefreshInterval;
  enablePushNotifications: boolean;
  enablePriceAlerts: boolean;
  offlineMode: boolean;

  // Privacy Settings
  enableAnalytics: boolean;
  enableCrashReporting: boolean;

  // Setters
  setBiometricEnabled: (enabled: boolean) => void;
  setAutoLockEnabled: (enabled: boolean) => void;
  setAutoLockTimeout: (timeout: number) => void;
  setHideBalancesOnAppSwitch: (hide: boolean) => void;
  setShowTestnetCoins: (show: boolean) => void;
  setHideSmallBalances: (hide: boolean) => void;
  setSmallBalanceThreshold: (threshold: number) => void;
  setNumberFormat: (format: NumberFormat) => void;
  setShowPercentageChanges: (show: boolean) => void;
  setRefreshInterval: (interval: RefreshInterval) => void;
  setEnablePushNotifications: (enabled: boolean) => void;
  setEnablePriceAlerts: (enabled: boolean) => void;
  setOfflineMode: (offline: boolean) => void;
  setEnableAnalytics: (enabled: boolean) => void;
  setEnableCrashReporting: (enabled: boolean) => void;
  resetToDefaults: () => void;
  loading: boolean;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(
  undefined,
);

const SETTINGS_STORAGE_KEY = "@wallet_app_settings";

const defaultSettings = {
  biometricEnabled: false,
  autoLockEnabled: true,
  autoLockTimeout: 5,
  hideBalancesOnAppSwitch: true,
  showTestnetCoins: false,
  hideSmallBalances: false,
  smallBalanceThreshold: 1,
  numberFormat: "default" as NumberFormat,
  showPercentageChanges: true,
  refreshInterval: "30s" as RefreshInterval,
  enablePushNotifications: true,
  enablePriceAlerts: false,
  offlineMode: false,
  enableAnalytics: false,
  enableCrashReporting: true,
};

export function AppSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load settings from storage
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error("Failed to load app settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await AsyncStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(newSettings),
      );
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save app settings:", error);
    }
  };

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const resetToDefaults = async () => {
    try {
      await AsyncStorage.removeItem(SETTINGS_STORAGE_KEY);
      setSettings(defaultSettings);
    } catch (error) {
      console.error("Failed to reset settings:", error);
    }
  };

  const value: AppSettingsContextType = {
    // Current values
    ...settings,
    loading,

    // Setters
    setBiometricEnabled: (enabled) =>
      updateSetting("biometricEnabled", enabled),
    setAutoLockEnabled: (enabled) => updateSetting("autoLockEnabled", enabled),
    setAutoLockTimeout: (timeout) => updateSetting("autoLockTimeout", timeout),
    setHideBalancesOnAppSwitch: (hide) =>
      updateSetting("hideBalancesOnAppSwitch", hide),
    setShowTestnetCoins: (show) => updateSetting("showTestnetCoins", show),
    setHideSmallBalances: (hide) => updateSetting("hideSmallBalances", hide),
    setSmallBalanceThreshold: (threshold) =>
      updateSetting("smallBalanceThreshold", threshold),
    setNumberFormat: (format) => updateSetting("numberFormat", format),
    setShowPercentageChanges: (show) =>
      updateSetting("showPercentageChanges", show),
    setRefreshInterval: (interval) =>
      updateSetting("refreshInterval", interval),
    setEnablePushNotifications: (enabled) =>
      updateSetting("enablePushNotifications", enabled),
    setEnablePriceAlerts: (enabled) =>
      updateSetting("enablePriceAlerts", enabled),
    setOfflineMode: (offline) => updateSetting("offlineMode", offline),
    setEnableAnalytics: (enabled) => updateSetting("enableAnalytics", enabled),
    setEnableCrashReporting: (enabled) =>
      updateSetting("enableCrashReporting", enabled),
    resetToDefaults,
  };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error(
      "useAppSettings must be used within an AppSettingsProvider",
    );
  }
  return context;
}

// Helper functions for settings
export const refreshIntervalLabels = {
  "5s": "5 seconds",
  "10s": "10 seconds",
  "30s": "30 seconds",
  "1m": "1 minute",
  "5m": "5 minutes",
};

export const numberFormatLabels = {
  default: "Default (1,234.56)",
  compact: "Compact (1.2K)",
  scientific: "Scientific (1.23e3)",
};

export const autoLockTimeouts = [
  { value: 1, label: "1 minute" },
  { value: 2, label: "2 minutes" },
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
];
