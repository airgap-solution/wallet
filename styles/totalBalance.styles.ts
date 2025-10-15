import { StyleSheet } from "react-native";
import { theme } from "@/theme";

export const totalBalanceStyles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },

  balanceCard: {
    position: "relative",
    width: "100%",
    backgroundColor: "#1f1f1f",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#333333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },

  grayBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1f1f1f",
    borderRadius: 24,
  },

  cardContent: {
    padding: theme.spacing.xxxl,
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },

  label: {
    fontSize: theme.typography.fontSizes.lg,
    color: "#a0a0a0",
    fontWeight: theme.typography.fontWeights.bold,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: theme.spacing.lg,
  },

  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: "100%",
  },

  balance: {
    fontSize: 32,
    fontWeight: theme.typography.fontWeights.extrabold,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
    textShadowColor: "rgba(255, 255, 255, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    flexShrink: 1,
    textAlign: "center",
    maxWidth: "85%",
  },

  eyeButton: {
    marginLeft: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: "#2a2a2a",
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: "#404040",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  cleanEyeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginLeft: theme.spacing.lg,
  },

  changeContainer: {
    alignItems: "center",
  },

  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: "center",
  },

  changeBadgePositive: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: "rgba(34, 197, 94, 0.5)",
  },

  changeBadgeNegative: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderColor: "rgba(239, 68, 68, 0.5)",
  },

  changeBadgeNeutral: {
    backgroundColor: "rgba(156, 163, 175, 0.2)",
    borderColor: "rgba(156, 163, 175, 0.5)",
  },

  changePercent: {
    fontSize: theme.typography.fontSizes.md,
    fontWeight: theme.typography.fontWeights.bold,
    letterSpacing: 0.2,
  },

  changeLabel: {
    fontSize: theme.typography.fontSizes.xs,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeights.medium,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    flexShrink: 0,
  },
});
