import { StyleSheet } from "react-native";
import { theme } from "@/theme";

export const homeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  floatingButton: {
    position: "absolute",
    bottom: theme.spacing.xxxl,
    right: theme.spacing.lg,
    width: 68,
    height: 68,
    borderRadius: 34,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
  },

  floatingButtonPressed: {
    transform: [{ scale: 0.92 }],
  },

  floatingButtonGradient: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    paddingTop: theme.dimensions.headerHeight + theme.spacing.xl,
  },

  modalContent: {
    backgroundColor: "#1f1f1f",
    borderRadius: theme.borderRadius.xxl,
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderColor: "#333333",
    padding: theme.spacing.xxxl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xxxl,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
  },

  modalTitle: {
    fontSize: 28,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeights.extrabold,
    letterSpacing: -0.5,
  },

  closeButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "#333333",
  },

  sectionLabel: {
    fontSize: theme.typography.fontSizes.md,
    color: "#a0a0a0",
    fontWeight: theme.typography.fontWeights.bold,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },

  // Coin selector styles
  coinSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xxxl,
    padding: theme.spacing.sm,
  },

  coinOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: "#2a2a2a",
    borderWidth: 2,
    borderColor: "#404040",
    minWidth: 120,
  },

  coinOptionSelected: {
    backgroundColor: "#4f46e5",
    borderColor: "#6366f1",
    transform: [{ scale: 1.05 }],
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  coinOptionImage: {
    width: 28,
    height: 28,
    marginRight: theme.spacing.md,
  },

  coinOptionText: {
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeights.semibold,
    fontSize: theme.typography.fontSizes.md,
  },

  coinOptionTextSelected: {
    color: "#ffffff",
    fontWeight: theme.typography.fontWeights.bold,
  },

  // Input styles
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#2a2a2a",
    borderWidth: 2,
    borderColor: "#404040",
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.xxxl,
    minHeight: 60,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  inputContainerFocused: {
    borderColor: "#6366f1",
    backgroundColor: "#2d2d2d",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  inputIcon: {
    marginRight: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },

  input: {
    flex: 1,
    padding: theme.spacing.sm,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.medium,
    textAlignVertical: "top",
    minHeight: 44,
    lineHeight: 22,
  },

  // Modal action buttons
  modalActions: {
    flexDirection: "row",
    gap: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#333333",
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#2a2a2a",
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#404040",
    minHeight: 52,
    justifyContent: "center",
  },

  cancelButtonText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
  },

  confirmButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    minHeight: 52,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  confirmButtonDisabled: {
    opacity: 0.5,
  },

  confirmButtonGradient: {
    paddingVertical: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },

  confirmButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.extrabold,
    letterSpacing: 0.5,
  },

  // List styles
  listContainer: {
    paddingBottom: 120, // Account for floating button with extra space
    paddingHorizontal: theme.spacing.lg,
    flexGrow: 1,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.huge,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },

  emptyStateText: {
    fontSize: theme.typography.fontSizes.xl,
    color: theme.colors.text.secondary,
    textAlign: "center",
    marginTop: theme.spacing.xl,
    lineHeight: 28,
    letterSpacing: 0.3,
  },

  emptyStateSubtext: {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.tertiary,
    textAlign: "center",
    marginTop: theme.spacing.md,
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 2,
    borderColor: "rgba(239, 68, 68, 0.4)",
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.lg,
    marginTop: theme.spacing.xl,
    alignItems: "center",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  errorText: {
    color: "#ff6b6b",
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.semibold,
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: 0.2,
  },

  retryButton: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: "#ef4444",
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: "#dc2626",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  retryButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSizes.lg,
    fontWeight: theme.typography.fontWeights.bold,
    letterSpacing: 0.5,
  },

  // Loading states
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.huge,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },

  loadingText: {
    fontSize: theme.typography.fontSizes.lg,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.lg,
  },

  // Refresh control
  refreshContainer: {
    paddingVertical: theme.spacing.lg,
  },

  // Filter notification
  filterNotification: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 193, 7, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.3)",
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },

  filterNotificationText: {
    fontSize: theme.typography.fontSizes.sm,
    color: "#facc15",
    fontWeight: theme.typography.fontWeights.medium,
    letterSpacing: 0.2,
  },
});
