import React, { useState } from "react";
import { View, TouchableOpacity, Animated, Dimensions } from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";

import { ThemedText } from "./ThemedText";
import { SkeletonLine } from "./common/SkeletonLoader";
import { formatCurrency } from "@/utils/formatters";
import { usePressAnimation } from "@/utils/animations";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { totalBalanceStyles } from "@/styles/totalBalance.styles";
import { theme } from "@/theme";
import type { TotalBalanceProps } from "@/types";

export default function TotalBalance({
  total,
  changePercent,
  fiat,
  isLoading = false,
}: TotalBalanceProps) {
  const [hide, setHide] = useState(false);
  const { numberFormat } = useAppSettings();

  const {
    animatedValue: scaleAnim,
    animateIn,
    animateOut,
  } = usePressAnimation();

  const isActuallyLoading = isLoading;
  const changeIsPositive = changePercent > 0;
  const changeIsNegative = changePercent < 0;
  const changeIsZeroPercent = changePercent === 0;
  const changeColor = changeIsPositive
    ? theme.colors.success
    : changeIsNegative
      ? theme.colors.error
      : theme.colors.text.secondary;

  const handleEyePress = () => {
    animateIn();
    setTimeout(() => {
      animateOut();
      setHide(!hide);
    }, 100);
  };

  return (
    <View style={totalBalanceStyles.container}>
      <View style={totalBalanceStyles.balanceCard}>
        {/* Modern gray background */}
        <View style={totalBalanceStyles.grayBackground} />

        {/* Content */}
        <View style={totalBalanceStyles.cardContent}>
          {/* Label */}
          <ThemedText style={totalBalanceStyles.label}>
            Total Portfolio Value
          </ThemedText>

          {/* Balance Row */}
          <View style={totalBalanceStyles.balanceRow}>
            {isActuallyLoading ? (
              <SkeletonLine width={220} height={48} />
            ) : (
              <>
                <ThemedText type="title" style={totalBalanceStyles.balance}>
                  {hide
                    ? "••••••••"
                    : formatCurrency(
                        total,
                        fiat,
                        "en-CA",
                        total >= 100000 ||
                          (numberFormat === "default" && total >= 10000)
                          ? "compact"
                          : numberFormat,
                      )}
                </ThemedText>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <TouchableOpacity
                    onPress={handleEyePress}
                    style={totalBalanceStyles.cleanEyeButton}
                  >
                    <Feather
                      name={hide ? "eye-off" : "eye"}
                      size={16}
                      color={theme.colors.text.secondary}
                    />
                  </TouchableOpacity>
                </Animated.View>
              </>
            )}
          </View>

          {/* Change Indicator */}
          {!isActuallyLoading && (
            <View style={totalBalanceStyles.changeContainer}>
              <View
                style={[
                  totalBalanceStyles.changeBadge,
                  changeIsPositive
                    ? totalBalanceStyles.changeBadgePositive
                    : changeIsNegative
                      ? totalBalanceStyles.changeBadgeNegative
                      : totalBalanceStyles.changeBadgeNeutral,
                ]}
              >
                <MaterialIcons
                  name={
                    changeIsPositive
                      ? "trending-up"
                      : changeIsNegative
                        ? "trending-down"
                        : "trending-flat"
                  }
                  size={14}
                  color={changeColor}
                />
                <ThemedText
                  style={[
                    totalBalanceStyles.changePercent,
                    { color: changeColor },
                  ]}
                >
                  {Math.abs(changePercent).toFixed(2)}%
                </ThemedText>
                <ThemedText style={totalBalanceStyles.changeLabel}>
                  today
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
