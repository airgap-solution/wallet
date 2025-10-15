import * as LocalAuthentication from "expo-local-authentication";
import { Alert, Platform } from "react-native";

export interface BiometricAuthOptions {
  promptMessage?: string;
  cancelLabel?: string;
  fallbackLabel?: string;
  disableDeviceFallback?: boolean;
}

export interface BiometricCapabilities {
  isAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
}

export class BiometricAuthService {
  /**
   * Check if biometric authentication is available and configured
   */
  static async getCapabilities(): Promise<BiometricCapabilities> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      return {
        isAvailable: hasHardware && isEnrolled,
        hasHardware,
        isEnrolled,
        supportedTypes,
      };
    } catch (error) {
      console.error("Error checking biometric capabilities:", error);
      return {
        isAvailable: false,
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
      };
    }
  }

  /**
   * Get a user-friendly description of available biometric types
   */
  static async getBiometricTypeDescription(): Promise<string> {
    const capabilities = await this.getCapabilities();

    if (!capabilities.isAvailable) {
      return "Not available";
    }

    const types = capabilities.supportedTypes;

    if (
      types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
    ) {
      return Platform.OS === "ios" ? "Face ID" : "Face Recognition";
    }

    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return Platform.OS === "ios" ? "Touch ID" : "Fingerprint";
    }

    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "Iris Recognition";
    }

    return "Biometric Authentication";
  }

  /**
   * Authenticate user with biometrics
   */
  static async authenticate(
    options: BiometricAuthOptions = {},
  ): Promise<boolean> {
    try {
      const capabilities = await this.getCapabilities();

      if (!capabilities.isAvailable) {
        if (!capabilities.hasHardware) {
          Alert.alert(
            "Biometric Authentication Unavailable",
            "This device does not support biometric authentication.",
          );
        } else if (!capabilities.isEnrolled) {
          Alert.alert(
            "Biometric Authentication Not Set Up",
            "Please set up biometric authentication in your device settings first.",
          );
        }
        return false;
      }

      const biometricType = await this.getBiometricTypeDescription();

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage:
          options.promptMessage || `Use ${biometricType} to access your wallet`,
        cancelLabel: options.cancelLabel || "Cancel",
        fallbackLabel: options.fallbackLabel || "Use Passcode",
        disableDeviceFallback: options.disableDeviceFallback || false,
      });

      if (result.success) {
        return true;
      } else {
        // Handle error cases - just check if user cancelled
        if (result.error) {
          const errorString = String(result.error);
          if (
            errorString.includes("UserCancel") ||
            errorString.includes("UserFallback")
          ) {
            // User cancelled or chose fallback - don't show error
            return false;
          }
        }

        // For all other errors, show a generic message
        Alert.alert(
          "Authentication Failed",
          "Biometric authentication failed. Please try again or check your device settings.",
        );
        return false;
      }
    } catch (error) {
      console.error("Biometric authentication error:", error);
      Alert.alert(
        "Authentication Error",
        "An error occurred during biometric authentication. Please try again.",
      );
      return false;
    }
  }

  /**
   * Check if biometric authentication should be required
   * Call this when the app comes to foreground or starts
   */
  static async shouldRequireAuthentication(
    biometricEnabled: boolean,
  ): Promise<boolean> {
    if (!biometricEnabled) {
      return false;
    }

    const capabilities = await this.getCapabilities();
    return capabilities.isAvailable;
  }

  /**
   * Request biometric authentication for wallet access
   * Returns true if authentication succeeded or is not required
   */
  static async authenticateForWalletAccess(
    biometricEnabled: boolean,
  ): Promise<boolean> {
    const shouldAuth = await this.shouldRequireAuthentication(biometricEnabled);

    if (!shouldAuth) {
      return true; // No authentication required
    }

    return await this.authenticate({
      promptMessage: "Authenticate to access your wallet",
      disableDeviceFallback: false,
    });
  }

  /**
   * Request biometric authentication for sensitive operations
   */
  static async authenticateForSensitiveOperation(
    operation: string,
    biometricEnabled: boolean,
  ): Promise<boolean> {
    const shouldAuth = await this.shouldRequireAuthentication(biometricEnabled);

    if (!shouldAuth) {
      return true; // No authentication required
    }

    return await this.authenticate({
      promptMessage: `Authenticate to ${operation}`,
      disableDeviceFallback: false,
    });
  }
}
