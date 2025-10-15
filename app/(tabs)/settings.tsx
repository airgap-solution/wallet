import React, { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
  TouchableOpacity,
  Alert,
  Linking,
  ToastAndroid,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { useFiat } from "@/contexts/FiatContext";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  BiometricAuthService,
  BiometricCapabilities,
} from "@/services/BiometricAuth";

const fiatOptions = ["USD", "CAD", "EUR", "GBP", "JPY", "AUD", "CHF", "CNY"];
const refreshIntervals = [
  { value: "5s", label: "5 seconds" },
  { value: "10s", label: "10 seconds" },
  { value: "30s", label: "30 seconds" },
  { value: "1m", label: "1 minute" },
  { value: "5m", label: "5 minutes" },
];

const autoLockTimeouts = [
  { value: 1, label: "1 minute" },
  { value: 2, label: "2 minutes" },
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
];

const numberFormats = [
  { value: "default", label: "Default (1,234.56)" },
  { value: "compact", label: "Compact (1.2K)" },
  { value: "scientific", label: "Scientific (1.23e3)" },
];

const accentColors = [
  { value: "blue", label: "Blue", color: "#3b82f6" },
  { value: "purple", label: "Purple", color: "#8b5cf6" },
  { value: "green", label: "Green", color: "#10b981" },
  { value: "orange", label: "Orange", color: "#f59e0b" },
  { value: "pink", label: "Pink", color: "#ec4899" },
];

interface ModalState {
  visible: boolean;
  type:
    | "fiat"
    | "refresh"
    | "numberFormat"
    | "accentColor"
    | "threshold"
    | "autoLockTimeout"
    | null;
  data: any[];
  title: string;
}

export default function SettingsScreen() {
  const { fiat, setFiat } = useFiat();
  const appSettings = useAppSettings();
  const { theme, accentColor, setAccentColor } = useTheme();
  const [biometricCapabilities, setBiometricCapabilities] =
    useState<BiometricCapabilities>({
      isAvailable: false,
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
    });
  const [biometricTypeDescription, setBiometricTypeDescription] =
    useState<string>("Biometric Authentication");

  // Load biometric capabilities on component mount
  useEffect(() => {
    loadBiometricCapabilities();
  }, []);

  const loadBiometricCapabilities = async () => {
    try {
      const capabilities = await BiometricAuthService.getCapabilities();
      const typeDescription =
        await BiometricAuthService.getBiometricTypeDescription();

      setBiometricCapabilities(capabilities);
      setBiometricTypeDescription(typeDescription);
    } catch (error) {
      console.error("Error loading biometric capabilities:", error);
    }
  };

  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    type: null,
    data: [],
    title: "",
  });

  const openModal = (type: ModalState["type"], data: any[], title: string) => {
    setModalState({ visible: true, type, data, title });
  };

  const closeModal = () => {
    setModalState({ visible: false, type: null, data: [], title: "" });
  };

  const handleModalSelection = (value: string) => {
    switch (modalState.type) {
      case "fiat":
        setFiat(value);
        break;
      case "refresh":
        appSettings.setRefreshInterval(value as any);
        break;
      case "numberFormat":
        appSettings.setNumberFormat(value as any);
        break;
      case "accentColor":
        setAccentColor(value as any);
        break;
      case "threshold":
        appSettings.setSmallBalanceThreshold(parseFloat(value));
        break;
      case "autoLockTimeout":
        appSettings.setAutoLockTimeout(parseFloat(value));
        break;
    }
    closeModal();

    // Show success feedback
    if (Platform.OS === "android") {
      ToastAndroid.show("Setting updated successfully", ToastAndroid.SHORT);
    }
  };

  const handleContactSupport = () => {
    Linking.openURL(
      "mailto:support@walletapp.com?subject=Wallet Support Request",
    );
  };

  const handleRateApp = () => {
    // This would typically open the app store
    Alert.alert("Rate App", "This would open your app store to rate the app.");
  };

  const getCurrentValue = (type: string) => {
    switch (type) {
      case "fiat":
        return fiat;
      case "refresh":
        return (
          refreshIntervals.find((r) => r.value === appSettings.refreshInterval)
            ?.label || appSettings.refreshInterval
        );
      case "numberFormat":
        return (
          numberFormats.find((f) => f.value === appSettings.numberFormat)
            ?.label || appSettings.numberFormat
        );
      case "accentColor":
        return accentColor;
      case "threshold":
        return `$${appSettings.smallBalanceThreshold}`;
      case "autoLockTimeout":
        return (
          autoLockTimeouts.find((t) => t.value === appSettings.autoLockTimeout)
            ?.label || `${appSettings.autoLockTimeout} minutes`
        );
      default:
        return "";
    }
  };

  const renderModalItem = ({ item }: { item: any }) => {
    const isSelected =
      modalState.type === "fiat"
        ? item === fiat
        : modalState.type === "refresh"
          ? item.value === appSettings.refreshInterval
          : modalState.type === "numberFormat"
            ? item.value === appSettings.numberFormat
            : modalState.type === "accentColor"
              ? item.value === accentColor
              : modalState.type === "threshold"
                ? item.value === appSettings.smallBalanceThreshold
                : modalState.type === "autoLockTimeout"
                  ? item.value === appSettings.autoLockTimeout
                  : false;

    return (
      <TouchableOpacity
        style={[styles.modalItem, isSelected && styles.modalItemSelected]}
        onPress={() =>
          handleModalSelection(typeof item === "string" ? item : item.value)
        }
      >
        <View style={styles.modalItemContent}>
          {modalState.type === "accentColor" && (
            <View
              style={[styles.colorPreview, { backgroundColor: item.color }]}
            />
          )}
          <ThemedText
            style={[
              styles.modalItemText,
              isSelected && styles.modalItemTextSelected,
            ]}
          >
            {typeof item === "string" ? item : item.label}
          </ThemedText>
        </View>
        {isSelected && <MaterialIcons name="check" size={20} color="#4f46e5" />}
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Settings</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Customize your wallet experience
          </ThemedText>
        </View>

        {/* Currency & Display */}
        <SettingsSection
          title="Currency & Display"
          subtitle="Customize how amounts and data are displayed"
        >
          <SettingsRow
            title="Currency"
            subtitle="Primary currency for displaying values"
            icon="attach-money"
            iconColor="#10b981"
            type="selection"
            value={getCurrentValue("fiat")}
            onPress={() => openModal("fiat", fiatOptions, "Select Currency")}
          />
          <SettingsRow
            title="Number Format"
            subtitle="How numbers are displayed throughout the app"
            icon="format-list-numbered"
            iconColor="#f59e0b"
            type="selection"
            value={getCurrentValue("numberFormat")}
            onPress={() =>
              openModal("numberFormat", numberFormats, "Number Format")
            }
          />
          <SettingsRow
            title="Hide Small Balances"
            subtitle="Hide coins with very small values"
            icon="visibility-off"
            iconColor="#6b7280"
            type="toggle"
            toggleValue={appSettings.hideSmallBalances}
            onToggle={appSettings.setHideSmallBalances}
            disabled={appSettings.loading}
          />
          {appSettings.hideSmallBalances && (
            <SettingsRow
              title="Small Balance Threshold"
              subtitle={`Hide balances under ${appSettings.smallBalanceThreshold} ${fiat}`}
              icon="tune"
              iconColor="#8b5cf6"
              type="selection"
              value={`${appSettings.smallBalanceThreshold} ${fiat}`}
              onPress={() =>
                openModal(
                  "threshold",
                  [
                    { value: 0.01, label: `0.01 ${fiat}` },
                    { value: 0.1, label: `0.10 ${fiat}` },
                    { value: 1, label: `1.00 ${fiat}` },
                    { value: 5, label: `5.00 ${fiat}` },
                    { value: 10, label: `10.00 ${fiat}` },
                    { value: 25, label: `25.00 ${fiat}` },
                    { value: 50, label: `50.00 ${fiat}` },
                    { value: 100, label: `100.00 ${fiat}` },
                  ],
                  "Small Balance Threshold",
                )
              }
            />
          )}
          <SettingsRow
            title="Show Testnet Coins"
            subtitle="Display testnet cryptocurrencies"
            icon="science"
            iconColor="#8b5cf6"
            type="toggle"
            toggleValue={appSettings.showTestnetCoins}
            onToggle={appSettings.setShowTestnetCoins}
            disabled={appSettings.loading}
          />
        </SettingsSection>

        {/* Security & Privacy */}
        <SettingsSection
          title="Security & Privacy"
          subtitle="Keep your wallet secure and private"
        >
          <SettingsRow
            title="Biometric Authentication"
            subtitle={
              !biometricCapabilities.hasHardware
                ? "Not available on this device"
                : !biometricCapabilities.isEnrolled
                  ? `Set up ${biometricTypeDescription.toLowerCase()} in device settings first`
                  : biometricCapabilities.isAvailable
                    ? `Use ${biometricTypeDescription.toLowerCase()} to unlock wallet`
                    : "Biometric authentication unavailable"
            }
            icon="fingerprint"
            iconColor="#ef4444"
            type="toggle"
            toggleValue={appSettings.biometricEnabled}
            onToggle={(enabled) => {
              if (enabled && !biometricCapabilities.isAvailable) {
                Alert.alert(
                  "Biometric Authentication Unavailable",
                  !biometricCapabilities.hasHardware
                    ? "This device does not support biometric authentication."
                    : !biometricCapabilities.isEnrolled
                      ? `Please set up ${biometricTypeDescription.toLowerCase()} in your device settings first.`
                      : "Biometric authentication is currently unavailable.",
                );
                return;
              }
              appSettings.setBiometricEnabled(enabled);
            }}
            disabled={!biometricCapabilities.isAvailable}
          />
          <SettingsRow
            title="Auto Lock"
            subtitle="Automatically lock the app when inactive"
            icon="lock"
            iconColor="#f59e0b"
            type="toggle"
            toggleValue={appSettings.autoLockEnabled}
            onToggle={appSettings.setAutoLockEnabled}
          />
          {appSettings.autoLockEnabled && (
            <SettingsRow
              title="Auto Lock Timeout"
              subtitle="How long before the app locks automatically"
              icon="timer"
              iconColor="#f59e0b"
              type="selection"
              value={getCurrentValue("autoLockTimeout")}
              onPress={() =>
                openModal(
                  "autoLockTimeout",
                  autoLockTimeouts,
                  "Auto Lock Timeout",
                )
              }
            />
          )}
          <SettingsRow
            title="Hide on App Switch"
            subtitle="Hide balances when switching between apps"
            icon="visibility-off"
            iconColor="#6b7280"
            type="toggle"
            toggleValue={appSettings.hideBalancesOnAppSwitch}
            onToggle={appSettings.setHideBalancesOnAppSwitch}
          />
        </SettingsSection>

        {/* Data & Sync */}
        <SettingsSection
          title="Data & Sync"
          subtitle="Control how data is refreshed and stored"
        >
          <SettingsRow
            title="Refresh Interval"
            subtitle="How often to update coin prices and balances"
            icon="refresh"
            iconColor="#3b82f6"
            type="selection"
            value={getCurrentValue("refresh")}
            onPress={() =>
              openModal("refresh", refreshIntervals, "Refresh Interval")
            }
          />
          <SettingsRow
            title="Push Notifications"
            subtitle="Receive important updates and alerts"
            icon="notifications"
            iconColor="#10b981"
            type="toggle"
            toggleValue={appSettings.enablePushNotifications}
            onToggle={appSettings.setEnablePushNotifications}
          />
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection
          title="Appearance"
          subtitle="Customize the look and feel"
        >
          <SettingsRow
            title="Accent Color"
            subtitle="Primary color used throughout the app"
            icon="palette"
            iconColor="#ec4899"
            type="selection"
            value={getCurrentValue("accentColor")}
            onPress={() =>
              openModal("accentColor", accentColors, "Accent Color")
            }
          />
        </SettingsSection>

        {/* Support & About */}
        <SettingsSection
          title="Support & About"
          subtitle="Get help and learn more about the app"
        >
          <SettingsRow
            title="Contact Support"
            subtitle="Get help with issues or questions"
            icon="support-agent"
            iconColor="#10b981"
            type="action"
            onPress={handleContactSupport}
          />
          <SettingsRow
            title="Rate This App"
            subtitle="Leave a review on the app store"
            icon="star-rate"
            iconColor="#f59e0b"
            type="action"
            onPress={handleRateApp}
          />
          <SettingsRow
            title="Privacy Policy"
            subtitle="Read our privacy policy and terms"
            icon="policy"
            iconColor="#6b7280"
            type="action"
            onPress={() => Linking.openURL("https://walletapp.com/privacy")}
          />
          <SettingsRow
            title="Version"
            subtitle="v1.2.0 - Build 2024.1.1"
            icon="info"
            iconColor="#6b7280"
            type="selection"
            value="Latest"
            showChevron={false}
          />
        </SettingsSection>
      </ScrollView>

      {/* Selection Modal */}
      <Modal
        visible={modalState.visible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable onPress={() => {}}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>
                  {modalState.title}
                </ThemedText>
                <TouchableOpacity
                  onPress={closeModal}
                  style={styles.closeButton}
                >
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={theme.colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              <FlatList
                data={modalState.data}
                keyExtractor={(item, index) =>
                  typeof item === "string"
                    ? item
                    : item.value || index.toString()
                }
                renderItem={renderModalItem}
                style={styles.modalList}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 56 + 12,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 24,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1f1f1f",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: "80%",
    borderWidth: 1,
    borderColor: "#333333",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  modalList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#404040",
  },
  modalItemSelected: {
    backgroundColor: "rgba(79, 70, 229, 0.2)",
    borderColor: "#4f46e5",
  },
  modalItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
  },
  modalItemTextSelected: {
    color: "#a5b4fc",
    fontWeight: "600",
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
});
