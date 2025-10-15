import React from "react";
import { Animated, View, StyleSheet } from "react-native";
import { useShimmer } from "@/utils/animations";
import { theme } from "@/theme";
import type { SkeletonLineProps } from "@/types";

/**
 * Reusable skeleton loader component for loading states
 */
export const SkeletonLine: React.FC<
  SkeletonLineProps & { borderRadius?: number }
> = ({ width, height, style, borderRadius = theme.borderRadius.md }) => {
  const shimmerAnim = useShimmer();

  const backgroundColor = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.18)"],
  });

  const shadowOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.3],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity,
          shadowRadius: 4,
          elevation: 2,
        },
        style,
      ]}
    />
  );
};

/**
 * Skeleton for text lines
 */
export const SkeletonText: React.FC<{
  lines?: number;
  lineHeight?: number;
  spacing?: number;
  lastLineWidth?: number;
}> = ({
  lines = 1,
  lineHeight = 16,
  spacing = theme.spacing.sm,
  lastLineWidth = 0.7,
}) => {
  return (
    <View style={styles.textContainer}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLine
          key={index}
          width={index === lines - 1 ? lastLineWidth * 100 + "%" : "100%"}
          height={lineHeight}
          style={index > 0 ? { marginTop: spacing } : undefined}
        />
      ))}
    </View>
  );
};

/**
 * Skeleton for circular elements (avatars, icons)
 */
export const SkeletonCircle: React.FC<{
  size: number;
  style?: any;
}> = ({ size, style }) => {
  return (
    <SkeletonLine
      width={size}
      height={size}
      style={style}
      borderRadius={size / 2}
    />
  );
};

/**
 * Skeleton for rectangular cards
 */
export const SkeletonCard: React.FC<{
  width?: number | string;
  height?: number;
  style?: any;
}> = ({ width = "100%", height = theme.dimensions.cardMinHeight, style }) => {
  return (
    <View style={[styles.card, { width, height }, style]}>
      <SkeletonLine width={100} height={height} />
    </View>
  );
};

/**
 * Complex skeleton for coin card
 */
export const SkeletonCoinCard: React.FC = () => {
  return (
    <View style={styles.coinCard}>
      <View style={styles.coinCardContent}>
        <SkeletonCircle size={48} />

        <View style={styles.coinCardInfo}>
          <View style={styles.coinCardHeader}>
            <SkeletonLine width={120} height={18} />
            <SkeletonLine width={40} height={16} />
          </View>

          <SkeletonLine
            width={140}
            height={24}
            style={styles.coinCardBalance}
          />

          <View style={styles.coinCardDetails}>
            <SkeletonLine width={100} height={14} />
            <SkeletonLine width={80} height={14} />
          </View>
        </View>
      </View>
    </View>
  );
};

/**
 * Skeleton for total balance card
 */
export const SkeletonTotalBalance: React.FC = () => {
  return (
    <View style={styles.totalBalanceCard}>
      <SkeletonLine width={180} height={16} style={styles.totalBalanceLabel} />
      <SkeletonLine width={220} height={48} style={styles.totalBalanceAmount} />
      <SkeletonLine width={100} height={20} style={styles.totalBalanceChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },

  textContainer: {
    width: "100%",
  },

  card: {
    backgroundColor: "#1f1f1f",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#333333",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  coinCard: {
    backgroundColor: "#1f1f1f",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#333333",
    marginBottom: theme.spacing.md,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  coinCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
  },

  coinCardInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },

  coinCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },

  coinCardBalance: {
    marginBottom: theme.spacing.xs,
  },

  coinCardDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.md,
  },

  totalBalanceCard: {
    alignItems: "center",
    padding: theme.spacing.xxxl,
    backgroundColor: "#1f1f1f",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#333333",
    marginBottom: theme.spacing.xxl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },

  totalBalanceLabel: {
    marginBottom: theme.spacing.md,
  },

  totalBalanceAmount: {
    marginBottom: theme.spacing.lg,
  },

  totalBalanceChange: {
    // No additional margin needed
  },
});

export default SkeletonLine;
