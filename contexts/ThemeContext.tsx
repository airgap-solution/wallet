import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppearanceMode = "dark" | "light" | "auto";
export type AccentColor = "blue" | "purple" | "green" | "orange" | "pink";

interface ThemeContextType {
  appearanceMode: AppearanceMode;
  accentColor: AccentColor;
  setAppearanceMode: (mode: AppearanceMode) => void;
  setAccentColor: (color: AccentColor) => void;
  isDarkMode: boolean;
  loading: boolean;
  theme: typeof dynamicTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@wallet_theme_settings";

// Accent color palette
export const accentColors = {
  blue: "#3b82f6",
  purple: "#8b5cf6",
  green: "#10b981",
  orange: "#f59e0b",
  pink: "#ec4899",
};

// Base theme that will be dynamically updated
const baseTheme = {
  colors: {
    // Primary colors (will be overridden by accent color)
    primary: "#3b82f6",
    secondary: "#1e40af",

    // Background colors
    background: "#121212",
    surface: "rgba(30, 30, 30, 0.6)",
    card: "rgba(30, 30, 30, 0.8)",

    // Text colors
    text: {
      primary: "#ffffff",
      secondary: "rgba(255, 255, 255, 0.7)",
      tertiary: "rgba(255, 255, 255, 0.5)",
      disabled: "rgba(255, 255, 255, 0.3)",
    },

    // Status colors
    success: "#4ade80",
    error: "#f87171",
    warning: "#facc15",
    info: "#60a5fa",

    // Crypto coin colors
    crypto: {
      btc: "#F7931A",
      eth: "#627EEA",
      kas: "#70C7BA",
      sol: "#9945FF",
    },

    // Border and overlay colors
    border: "rgba(255, 255, 255, 0.1)",
    overlay: "rgba(0, 0, 0, 0.8)",

    // Gradient colors (will be dynamically updated)
    gradients: {
      primary: ["#3b82f6", "#1e40af"] as string[],
      secondary: [
        "rgba(59, 130, 246, 0.3)",
        "rgba(30, 64, 175, 0.3)",
        "rgba(59, 130, 246, 0.1)",
      ] as string[],
      card: [
        "rgba(59, 130, 246, 0.15)",
        "rgba(30, 64, 175, 0.15)",
        "rgba(59, 130, 246, 0.05)",
      ] as string[],
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
  },

  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    xxxl: 24,
    full: 50,
  },

  typography: {
    fontSizes: {
      xs: 11,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
      xxxl: 24,
      huge: 32,
      massive: 40,
    },

    fontWeights: {
      light: "300",
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
    },

    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },

    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      wider: 1,
      widest: 1.2,
    },
  },

  shadows: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    xl: {
      shadowColor: "#3b82f6" as string, // Will be updated with accent color
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 12,
    },
  },

  animations: {
    timing: {
      fast: 200,
      normal: 300,
      slow: 500,
      slower: 800,
    },

    easing: {
      ease: "ease",
      easeIn: "ease-in",
      easeOut: "ease-out",
      easeInOut: "ease-in-out",
    },
  },

  dimensions: {
    buttonHeight: 48,
    inputHeight: 44,
    headerHeight: 56,
    tabBarHeight: 60,
    modalWidth: 400,
    cardMinHeight: 80,
    iconSize: {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
      xxl: 48,
    },
  },
} as const;

// Create dynamic theme that updates based on accent color
let dynamicTheme = { ...baseTheme };

// Function to generate accent-based colors
const generateAccentColors = (accentColor: AccentColor) => {
  const primaryColor = accentColors[accentColor];

  // Generate secondary color (darker variant)
  const secondaryColor = (() => {
    switch (accentColor) {
      case "blue":
        return "#1e40af";
      case "purple":
        return "#7c3aed";
      case "green":
        return "#059669";
      case "orange":
        return "#d97706";
      case "pink":
        return "#db2777";
      default:
        return "#1e40af";
    }
  })();

  // Generate gradient variants
  const gradientLight = (() => {
    switch (accentColor) {
      case "blue":
        return "rgba(59, 130, 246, 0.3)";
      case "purple":
        return "rgba(139, 92, 246, 0.3)";
      case "green":
        return "rgba(16, 185, 129, 0.3)";
      case "orange":
        return "rgba(245, 158, 11, 0.3)";
      case "pink":
        return "rgba(236, 72, 153, 0.3)";
      default:
        return "rgba(59, 130, 246, 0.3)";
    }
  })();

  const gradientMedium = (() => {
    switch (accentColor) {
      case "blue":
        return "rgba(30, 64, 175, 0.3)";
      case "purple":
        return "rgba(124, 58, 237, 0.3)";
      case "green":
        return "rgba(5, 150, 105, 0.3)";
      case "orange":
        return "rgba(217, 119, 6, 0.3)";
      case "pink":
        return "rgba(219, 39, 119, 0.3)";
      default:
        return "rgba(30, 64, 175, 0.3)";
    }
  })();

  const gradientFaint = (() => {
    switch (accentColor) {
      case "blue":
        return "rgba(59, 130, 246, 0.1)";
      case "purple":
        return "rgba(139, 92, 246, 0.1)";
      case "green":
        return "rgba(16, 185, 129, 0.1)";
      case "orange":
        return "rgba(245, 158, 11, 0.1)";
      case "pink":
        return "rgba(236, 72, 153, 0.1)";
      default:
        return "rgba(59, 130, 246, 0.1)";
    }
  })();

  return {
    primary: primaryColor,
    secondary: secondaryColor,
    gradientLight,
    gradientMedium,
    gradientFaint,
  };
};

// Function to update the dynamic theme
const updateThemeWithAccent = (accentColor: AccentColor) => {
  const accentData = generateAccentColors(accentColor);

  dynamicTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: accentData.primary as any,
      secondary: accentData.secondary as any,
      gradients: {
        primary: [accentData.primary, accentData.secondary] as any,
        secondary: [
          accentData.gradientLight,
          accentData.gradientMedium,
          accentData.gradientFaint,
        ] as any,
        card: [
          `${accentData.primary}26`,
          `${accentData.secondary}26`,
          `${accentData.primary}0D`,
        ] as any, // 15% and 5% opacity
      },
    },
    shadows: {
      ...baseTheme.shadows,
      xl: {
        ...baseTheme.shadows.xl,
        shadowColor: accentData.primary as any,
      },
    },
  };
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [appearanceMode, setAppearanceModeState] =
    useState<AppearanceMode>("dark");
  const [accentColor, setAccentColorState] = useState<AccentColor>("blue");
  const [loading, setLoading] = useState(true);

  // Determine if dark mode should be active
  const isDarkMode =
    appearanceMode === "dark" || (appearanceMode === "auto" && true); // For now, always default to dark in auto mode

  // Load theme settings from storage
  useEffect(() => {
    loadThemeSettings();
  }, []);

  // Update theme whenever accent color changes
  useEffect(() => {
    updateThemeWithAccent(accentColor);
  }, [accentColor]);

  const loadThemeSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedSettings) {
        const { appearanceMode: savedMode, accentColor: savedColor } =
          JSON.parse(savedSettings);
        if (savedMode) setAppearanceModeState(savedMode);
        if (savedColor) {
          setAccentColorState(savedColor);
          updateThemeWithAccent(savedColor);
        }
      } else {
        // Initialize with default accent color
        updateThemeWithAccent("blue");
      }
    } catch (error) {
      console.error("Failed to load theme settings:", error);
      // Initialize with default on error
      updateThemeWithAccent("blue");
    } finally {
      setLoading(false);
    }
  };

  const saveThemeSettings = async (
    mode: AppearanceMode,
    color: AccentColor,
  ) => {
    try {
      await AsyncStorage.setItem(
        THEME_STORAGE_KEY,
        JSON.stringify({ appearanceMode: mode, accentColor: color }),
      );
    } catch (error) {
      console.error("Failed to save theme settings:", error);
    }
  };

  const setAppearanceMode = (mode: AppearanceMode) => {
    setAppearanceModeState(mode);
    saveThemeSettings(mode, accentColor);
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
    updateThemeWithAccent(color);
    saveThemeSettings(appearanceMode, color);
  };

  const value: ThemeContextType = {
    appearanceMode,
    accentColor,
    setAppearanceMode,
    setAccentColor,
    isDarkMode,
    loading,
    theme: dynamicTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Export the dynamic theme for use throughout the app
export { dynamicTheme as theme };

export type Theme = typeof dynamicTheme;
export type ThemeColors = typeof dynamicTheme.colors;
export type ThemeSpacing = typeof dynamicTheme.spacing;
export type ThemeTypography = typeof dynamicTheme.typography;
