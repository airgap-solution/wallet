import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { LinearGradient } from "expo-linear-gradient";

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);

type TotalBalanceProps = {
  total: number;
  changePercent: number;
  fiat: string;
};

// Enhanced shimmer skeleton
const SkeletonLine = ({ width, height, style }: any) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1500,
          easing: Easing.ease,
          useNativeDriver: false,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 1500,
          easing: Easing.ease,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, []);

  const backgroundColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.15)"],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: 12,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

export default function TotalBalance({
  total,
  changePercent,
  fiat,
}: TotalBalanceProps) {
  const [hide, setHide] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const color = changePercent >= 0 ? "#4ade80" : "#f87171";
  const isZero = total === 0;
  const changeIsPositive = changePercent >= 0;

  const handleEyePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    setHide(!hide);
  };

  return (
    <View style={styles.container}>
      {/* Glassmorphic card */}
      <View style={styles.balanceCard}>
        {/* Gradient background */}
        <LinearGradient
          colors={[
            "rgba(139, 92, 246, 0.15)",
            "rgba(59, 130, 246, 0.15)",
            "rgba(139, 92, 246, 0.05)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        />

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Label */}
          <ThemedText style={styles.label}>Total Portfolio Value</ThemedText>

          {/* Balance Row */}
          <View style={styles.balanceRow}>
            {isZero ? (
              <SkeletonLine width={220} height={48} />
            ) : (
              <>
                <ThemedText type="title" style={styles.balance}>
                  {hide ? "••••••••" : formatCurrency(total, fiat)}
                </ThemedText>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <TouchableOpacity
                    onPress={handleEyePress}
                    style={styles.eyeButton}
                  >
                    <Feather
                      name={hide ? "eye-off" : "eye"}
                      size={24}
                      color="rgba(255, 255, 255, 0.7)"
                    />
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}
          </View>

          {/* Change Indicator */}
          {!isZero && (
            <View style={styles.changeContainer}>
              <View
                style={[
                  styles.changeBadge,
                  changeIsPositive
                    ? styles.changeBadgePositive
                    : styles.changeBadgeNegative,
                ]}
              >
                <MaterialIcons
                  name={changeIsPositive ? "trending-up" : "trending-down"}
                  size={18}
                  color={color}
                />
                <ThemedText style={[styles.changePercent, { color }]}>
                  {Math.abs(changePercent).toFixed(2)}%
                </ThemedText>
                <ThemedText style={styles.changeLabel}>today</ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  balanceCard: {
    position: "relative",
    width: "100%",
    backgroundColor: "rgba(30, 30, 30, 0.6)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardContent: {
    padding: 24,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  balance: {
    fontSize: 40,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  eyeButton: {
    marginLeft: 16,
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  changeContainer: {
    alignItems: "center",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  changeBadgePositive: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(74, 222, 128, 0.3)",
  },
  changeBadgeNegative: {
    backgroundColor: "rgba(248, 113, 113, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.3)",
  },
  changePercent: {
    fontSize: 16,
    fontWeight: "700",
  },
  changeLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
    fontWeight: "500",
  },
});
