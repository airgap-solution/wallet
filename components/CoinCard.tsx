import React, { useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  PanResponder,
  Image,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";

import { ThemedText } from "./ThemedText";
import { SkeletonLine } from "./common/SkeletonLoader";
import { formatCurrency, formatCryptoAmount } from "@/utils/formatters";
import { BiometricAuthService } from "@/services/BiometricAuth";
import { usePressAnimation, useFlashOnChange } from "@/utils/animations";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { coinCardStyles } from "@/styles/coinCard.styles";
import { theme } from "@/theme";
import type { CoinCardProps } from "@/types";

export default function CoinCard({ coin, onPress, onDelete }: CoinCardProps) {
  const [hideBalance, setHideBalance] = useState(false);
  const { numberFormat, biometricEnabled } = useAppSettings();

  // Animations
  const {
    animatedValue: pressAnim,
    animateIn,
    animateOut,
  } = usePressAnimation();
  const translateX = useRef(new Animated.Value(0)).current;
  const flashAnim = useFlashOnChange(coin.fiatAmount);

  const isLoading = coin.fiatAmount === null || coin.fiatAmount === undefined;
  const change24h = coin.change24h ?? 0;
  const changeIsPositive = change24h > 0;
  const changeIsNegative = change24h < 0;

  const flashColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      theme.colors.text.primary,
      changeIsPositive
        ? theme.colors.success
        : changeIsNegative
          ? theme.colors.error
          : theme.colors.text.secondary,
    ],
  });

  // Pan responder for smooth swipe-to-delete gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only respond to horizontal swipes with significant movement
        return (
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
          Math.abs(gestureState.dx) > 15
        );
      },
      onPanResponderGrant: () => {
        // Start the gesture - flatten any existing offset
        translateX.setOffset((translateX as any)._value);
        translateX.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow swiping left (negative dx) with smooth animation
        const newValue = Math.max(Math.min(gestureState.dx, 0), -120);
        translateX.setValue(newValue);
      },
      onPanResponderRelease: (evt, gestureState) => {
        translateX.flattenOffset();

        // Determine threshold based on swipe distance and velocity
        const swipeThreshold = gestureState.vx < -0.5 ? -40 : -60;

        if (gestureState.dx < swipeThreshold) {
          // Swipe far enough or fast enough to reveal delete
          Animated.spring(translateX, {
            toValue: -120,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
        } else {
          // Snap back to original position
          Animated.spring(translateX, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        // Reset if gesture is terminated
        translateX.flattenOffset();
        Animated.spring(translateX, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }).start();
      },
    }),
  ).current;

  const handleDelete = async () => {
    // Animate back to original position first
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();

    // Check if biometric authentication is required for delete operation
    const authenticated =
      await BiometricAuthService.authenticateForSensitiveOperation(
        "delete this account",
        biometricEnabled,
      );

    if (authenticated) {
      onDelete(coin.raw?.Wallet?.XPub);
    }
  };

  const resetSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={coinCardStyles.cardWrapper}>
      <Animated.View
        style={[coinCardStyles.cardContainer, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[
            coinCardStyles.cardTouchableWrapper,
            { transform: [{ scale: pressAnim }] },
          ]}
        >
          <TouchableOpacity
            style={coinCardStyles.cardTouchable}
            onPress={() => {
              resetSwipe();
              onPress();
            }}
            onPressIn={animateIn}
            onPressOut={animateOut}
            activeOpacity={0.95}
            delayPressIn={50}
          >
            <View style={coinCardStyles.modernBackground}>
              {/* Card content */}
              <View style={coinCardStyles.cardContent}>
                <View style={coinCardStyles.row}>
                  {/* Coin Image with simple circular design */}
                  <View style={coinCardStyles.imageContainer}>
                    <View
                      style={[
                        coinCardStyles.coinImageWrapper,
                        { backgroundColor: `${coin.color}20` },
                      ]}
                    >
                      <Image
                        source={
                          typeof coin.image === "string"
                            ? { uri: coin.image }
                            : coin.image
                        }
                        style={coinCardStyles.coinImage}
                        resizeMode="contain"
                      />
                    </View>
                  </View>

                  <View style={coinCardStyles.contentSection}>
                    {/* Coin Name & Symbol */}
                    <View style={coinCardStyles.headerRow}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={coinCardStyles.coinName}
                      >
                        {coin.name}
                      </ThemedText>
                      <View
                        style={[
                          coinCardStyles.symbolBadge,
                          {
                            backgroundColor: `${coin.color}20`,
                            borderColor: `${coin.color}66`,
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            coinCardStyles.symbolText,
                            { color: coin.color },
                          ]}
                        >
                          {coin.symbol}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Fiat Balance */}
                    <View style={coinCardStyles.balanceRow}>
                      {isLoading ? (
                        <SkeletonLine width={140} height={24} />
                      ) : (
                        <Animated.Text
                          style={[
                            coinCardStyles.fiatAmount,
                            { color: flashColor },
                          ]}
                          numberOfLines={1}
                          adjustsFontSizeToFit
                          minimumFontScale={0.6}
                        >
                          {hideBalance
                            ? "••••••"
                            : formatCurrency(
                                coin.fiatAmount || 0,
                                coin.fiatCurrency,
                                "en-CA",
                                (coin.fiatAmount || 0) >= 100000 ||
                                  (numberFormat === "default" &&
                                    (coin.fiatAmount || 0) >= 10000)
                                  ? "compact"
                                  : numberFormat,
                              )}
                        </Animated.Text>
                      )}
                    </View>

                    {/* Coin Amount & 24h Change */}
                    <View style={coinCardStyles.detailsRow}>
                      {isLoading ? (
                        <>
                          <SkeletonLine width={100} height={16} />
                          <SkeletonLine
                            width={80}
                            height={16}
                            style={{ marginLeft: theme.spacing.md }}
                          />
                        </>
                      ) : (
                        <>
                          <ThemedText
                            style={coinCardStyles.coinAmount}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.7}
                          >
                            {hideBalance
                              ? "••••••"
                              : formatCryptoAmount(
                                  coin.coinAmount || 0,
                                  coin.symbol,
                                  8,
                                  (typeof coin.coinAmount === "number" &&
                                    coin.coinAmount >= 100000) ||
                                    (typeof coin.coinAmount === "string" &&
                                      parseFloat(coin.coinAmount) >= 100000) ||
                                    (numberFormat === "default" &&
                                      ((typeof coin.coinAmount === "number" &&
                                        coin.coinAmount >= 10000) ||
                                        (typeof coin.coinAmount === "string" &&
                                          parseFloat(coin.coinAmount) >=
                                            10000)))
                                    ? "compact"
                                    : numberFormat,
                                )}
                          </ThemedText>

                          {coin.change24h !== undefined &&
                            coin.change24h !== null && (
                              <View
                                style={[
                                  coinCardStyles.changeBadge,
                                  changeIsPositive
                                    ? coinCardStyles.changeBadgePositive
                                    : changeIsNegative
                                      ? coinCardStyles.changeBadgeNegative
                                      : coinCardStyles.changeBadgeNeutral,
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
                                  color={
                                    changeIsPositive
                                      ? theme.colors.success
                                      : changeIsNegative
                                        ? theme.colors.error
                                        : theme.colors.text.secondary
                                  }
                                />
                                <ThemedText
                                  style={[
                                    coinCardStyles.changeText,
                                    {
                                      color: changeIsPositive
                                        ? theme.colors.success
                                        : changeIsNegative
                                          ? theme.colors.error
                                          : theme.colors.text.secondary,
                                    },
                                  ]}
                                  numberOfLines={1}
                                  adjustsFontSizeToFit
                                  minimumFontScale={0.8}
                                >
                                  {hideBalance
                                    ? "••••"
                                    : `${changeIsPositive ? "+" : ""}${formatCurrency(
                                        Math.abs(change24h),
                                        coin.fiatCurrency,
                                        "en-CA",
                                        Math.abs(change24h) >= 100000 ||
                                          (numberFormat === "default" &&
                                            Math.abs(change24h) >= 1000)
                                          ? "compact"
                                          : numberFormat,
                                      )}`}
                                </ThemedText>
                              </View>
                            )}
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Eye button - positioned to not interfere with swipe */}
      {!isLoading && (
        <View style={coinCardStyles.eyeButtonContainer}>
          <TouchableOpacity
            onPress={() => setHideBalance(!hideBalance)}
            style={coinCardStyles.cleanEyeButton}
          >
            <Feather
              name={hideBalance ? "eye-off" : "eye"}
              size={16}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Slide-to-delete background - revealed when swiping left */}
      <Animated.View
        style={[
          coinCardStyles.slideDeleteBackground,
          {
            opacity: translateX.interpolate({
              inputRange: [-100, -20, 0],
              outputRange: [1, 0.3, 0],
              extrapolate: "clamp",
            }),
            transform: [
              {
                translateX: translateX.interpolate({
                  inputRange: [-100, 0],
                  outputRange: [0, 100],
                  extrapolate: "clamp",
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleDelete}
          style={coinCardStyles.slideDeleteAction}
          activeOpacity={0.8}
        >
          <View style={coinCardStyles.deleteIconContainer}>
            <MaterialIcons
              name="delete-outline"
              size={32}
              color={theme.colors.error}
            />
          </View>
          <ThemedText style={coinCardStyles.slideDeleteText}>Delete</ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
