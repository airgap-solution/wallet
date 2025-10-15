import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import { BiometricAuthService } from "@/services/BiometricAuth";
import { useAppSettings } from "./AppSettingsContext";

interface AuthContextType {
  isLocked: boolean;
  isAuthenticating: boolean;
  isHiddenForAppSwitch: boolean;
  unlockApp: () => Promise<boolean>;
  lockApp: () => void;
  checkAuthenticationRequired: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isHiddenForAppSwitch, setIsHiddenForAppSwitch] = useState(false);
  const {
    biometricEnabled,
    autoLockEnabled,
    autoLockTimeout,
    hideBalancesOnAppSwitch,
  } = useAppSettings();

  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkInitialAuthenticationState = useCallback(async () => {
    if (biometricEnabled) {
      const capabilities = await BiometricAuthService.getCapabilities();
      if (capabilities.isAvailable) {
        setIsLocked(true);
      }
    }
  }, [biometricEnabled]);

  const handleAppForeground = useCallback(async () => {
    // Clear any pending lock timer
    if (lockTimer.current) {
      clearTimeout(lockTimer.current);
      lockTimer.current = null;
    }

    // Check if we should lock based on background time
    if (backgroundTime.current && autoLockEnabled && biometricEnabled) {
      const timeInBackground = Date.now() - backgroundTime.current;
      const lockTimeoutMs = autoLockTimeout * 60 * 1000;

      if (timeInBackground >= lockTimeoutMs) {
        setIsLocked(true);
      }
    }

    // Reset background time
    backgroundTime.current = null;

    // Show balances when returning to foreground
    if (hideBalancesOnAppSwitch) {
      setIsHiddenForAppSwitch(false);
    }

    // Check if authentication is required for app access
    await checkAuthenticationRequired();
  }, [
    autoLockEnabled,
    autoLockTimeout,
    biometricEnabled,
    hideBalancesOnAppSwitch,
  ]);

  const handleAppBackground = useCallback(() => {
    backgroundTime.current = Date.now();

    // Clear any existing timer
    if (lockTimer.current) {
      clearTimeout(lockTimer.current);
      lockTimer.current = null;
    }

    // If auto-lock is enabled and biometric auth is available, set a timer
    if (autoLockEnabled && biometricEnabled) {
      const timeoutMs = autoLockTimeout * 60 * 1000; // Convert minutes to milliseconds

      lockTimer.current = setTimeout(() => {
        setIsLocked(true);
      }, timeoutMs);
    }

    // Hide balances when going to background if setting is enabled
    if (hideBalancesOnAppSwitch) {
      setIsHiddenForAppSwitch(true);
    }
  }, [
    autoLockEnabled,
    autoLockTimeout,
    biometricEnabled,
    hideBalancesOnAppSwitch,
  ]);

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App has come to the foreground
        handleAppForeground();
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        handleAppBackground();
      }

      appState.current = nextAppState;
    },
    [handleAppForeground, handleAppBackground],
  );

  // Check if authentication is required when app starts
  useEffect(() => {
    checkInitialAuthenticationState();
  }, [checkInitialAuthenticationState]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription?.remove();
  }, [handleAppStateChange]);

  const checkAuthenticationRequired = useCallback(async () => {
    if (biometricEnabled) {
      const shouldAuth =
        await BiometricAuthService.shouldRequireAuthentication(
          biometricEnabled,
        );
      if (shouldAuth && !isLocked) {
        setIsLocked(true);
      }
    }
  }, [biometricEnabled]);

  const unlockApp = async (): Promise<boolean> => {
    if (!isLocked) {
      return true;
    }

    setIsAuthenticating(true);

    try {
      const success =
        await BiometricAuthService.authenticateForWalletAccess(
          biometricEnabled,
        );

      if (success) {
        setIsLocked(false);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error during app unlock:", error);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const lockApp = () => {
    if (biometricEnabled) {
      setIsLocked(true);
    }
  };

  const value: AuthContextType = {
    isLocked,
    isAuthenticating,
    isHiddenForAppSwitch,
    unlockApp,
    lockApp,
    checkAuthenticationRequired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
