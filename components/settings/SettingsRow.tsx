import React from "react";
import { View, TouchableOpacity, Switch } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "../ThemedText";
import { useTheme } from "@/contexts/ThemeContext";

export interface SettingsRowProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconColor?: string;
  value?: string;
  type?: "navigation" | "toggle" | "selection" | "action";
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  showChevron?: boolean;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  value,
  type = "navigation",
  toggleValue = false,
  onToggle,
  onPress,
  disabled = false,
  destructive = false,
  showChevron = true,
}) => {
  const { theme } = useTheme();
  const defaultIconColor = iconColor || theme.colors.text.secondary;
  const styles = getStyles(theme);
  const handlePress = () => {
    if (disabled) return;
    onPress?.();
  };

  const renderRightContent = () => {
    switch (type) {
      case "toggle":
        return (
          <Switch
            value={toggleValue}
            onValueChange={onToggle}
            disabled={disabled}
            trackColor={{
              false: "rgba(255, 255, 255, 0.2)",
              true: theme.colors.primary,
            }}
            thumbColor={toggleValue ? "#ffffff" : "#f4f3f4"}
            ios_backgroundColor="rgba(255, 255, 255, 0.2)"
          />
        );
      case "selection":
        return (
          <View style={styles.selectionContainer}>
            {value && (
              <ThemedText style={styles.selectionValue}>{value}</ThemedText>
            )}
            {showChevron && (
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={theme.colors.text.tertiary}
                style={styles.chevron}
              />
            )}
          </View>
        );
      case "action":
        return showChevron ? (
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={
              destructive ? theme.colors.error : theme.colors.text.tertiary
            }
            style={styles.chevron}
          />
        ) : null;
      default:
        return showChevron ? (
          <MaterialIcons
            name="chevron-right"
            size={20}
            color={theme.colors.text.tertiary}
            style={styles.chevron}
          />
        ) : null;
    }
  };

  const isInteractive = type !== "toggle" && onPress;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        disabled && styles.disabled,
        destructive && styles.destructive,
      ]}
      onPress={handlePress}
      disabled={!isInteractive || disabled}
      activeOpacity={isInteractive ? 0.7 : 1}
    >
      <View style={styles.leftContent}>
        {icon && (
          <View style={styles.iconContainer}>
            <MaterialIcons
              name={icon}
              size={24}
              color={destructive ? theme.colors.error : defaultIconColor}
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <ThemedText
            style={[
              styles.title,
              destructive && styles.destructiveText,
              disabled && styles.disabledText,
            ]}
          >
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
          )}
        </View>
      </View>
      {renderRightContent()}
    </TouchableOpacity>
  );
};

const getStyles = (theme: any) => ({
  container: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: "#1f1f1f",
    borderRadius: 12,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: "#333333",
  },
  disabled: {
    opacity: 0.5,
  },
  destructive: {
    borderColor: "rgba(239, 68, 68, 0.3)",
    backgroundColor: "rgba(239, 68, 68, 0.05)",
  },
  leftContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.tertiary,
    lineHeight: 18,
  },
  destructiveText: {
    color: theme.colors.error,
  },
  disabledText: {
    color: theme.colors.text.disabled,
  },
  selectionContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  selectionValue: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.sm,
  },
  chevron: {
    marginLeft: theme.spacing.xs,
  },
});

export default SettingsRow;
