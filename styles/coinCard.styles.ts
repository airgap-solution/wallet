import { StyleSheet } from "react-native";
import { theme } from "@/theme";

export const coinCardStyles = StyleSheet.create({
  cardWrapper: {
    marginBottom: theme.spacing.md,
    position: "relative",
  },

  cardContainer: {
    position: "relative",
    zIndex: 2,
  },

  cardTouchableWrapper: {
    backgroundColor: "transparent",
  },

  cardTouchable: {
    backgroundColor: "transparent",
    borderRadius: 16,
    overflow: "hidden",
  },

  modernBackground: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },

  cardContent: {
    padding: theme.spacing.lg,
  },

  slideDeleteBackground: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: "#dc2626",
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    shadowColor: "#dc2626",
    shadowOffset: { width: -6, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },

  slideDeleteAction: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    paddingHorizontal: theme.spacing.sm,
  },

  deleteIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },

  slideDeleteText: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  imageContainer: {
    position: "relative",
    marginRight: theme.spacing.md,
    width: theme.dimensions.iconSize.xxl,
    height: theme.dimensions.iconSize.xxl,
    justifyContent: "center",
    alignItems: "center",
  },

  coinImageWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    padding: 8,
  },

  coinImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },

  contentSection: {
    flex: 1,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },

  coinName: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    marginRight: theme.spacing.md,
    letterSpacing: -0.3,
  },

  symbolBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },

  symbolText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.extrabold,
    letterSpacing: 0.5,
  },

  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },

  fiatAmount: {
    fontSize: 24,
    fontWeight: theme.typography.fontWeights.extrabold,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
    flex: 1,
    flexShrink: 1,
  },

  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },

  coinAmount: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeights.semibold,
    letterSpacing: 0.3,
    flexShrink: 1,
  },

  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
  },

  changeBadgePositive: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
  },

  changeBadgeNegative: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },

  changeBadgeNeutral: {
    backgroundColor: "rgba(156, 163, 175, 0.15)",
  },

  changeText: {
    fontSize: theme.typography.fontSizes.sm,
    fontWeight: theme.typography.fontWeights.bold,
    marginLeft: theme.spacing.xs,
    letterSpacing: 0.2,
  },

  // Clean eye button styles (matching trash button design)
  eyeButtonContainer: {
    position: "absolute",
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    zIndex: 10,
  },

  cleanEyeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
});
