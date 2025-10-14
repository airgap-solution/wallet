import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Easing,
  PanResponder,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  ClipPath,
  Polygon,
  Image as SvgImage,
} from "react-native-svg";

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);

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
          borderRadius: 8,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

export default function CoinCard({ coin, onPress, onDelete }: any) {
  const [hideBalance, setHideBalance] = useState(false);
  const prevFiat = useRef<number | null>(null);
  const flashAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  // Flash animation when fiat balance changes
  useEffect(() => {
    if (
      prevFiat.current !== null &&
      coin.fiatAmount !== prevFiat.current &&
      coin.fiatAmount != null
    ) {
      flashAnim.setValue(0);
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }).start(() => flashAnim.setValue(0));
    }
    prevFiat.current = coin.fiatAmount;
  }, [coin.fiatAmount]);

  const flashColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      "#ffffff",
      coin.fiatAmount > (prevFiat.current || 0) ? "#4ade80" : "#f87171",
    ],
  });

  // Pan responder for swipe
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -80));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40) {
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
          }).start();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleDelete = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      onDelete(coin.raw?.Wallet?.XPub);
    });
  };

  const isLoading =
    coin.fiatAmount === undefined ||
    coin.fiatAmount === null ||
    Number.isNaN(coin.fiatAmount);

  const changeIsPositive = coin.change24h >= 0;

  return (
    <View style={styles.cardWrapper}>
      <Animated.View
        style={[
          styles.cardContainer,
          { transform: [{ scale: pressAnim }, { translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          {/* Glassmorphism background */}
          <View style={styles.glassBackground}>
            {/* Gradient border effect */}
            <LinearGradient
              colors={[
                "rgba(139, 92, 246, 0.3)",
                "rgba(59, 130, 246, 0.3)",
                "rgba(139, 92, 246, 0.1)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientBorder}
            />

            {/* Card content */}
            <View style={styles.cardContent}>
              <View style={styles.row}>
                {/* Coin Image with hexagon shape */}
                <View style={styles.imageContainer}>
                  <Svg width="48" height="48" viewBox="0 0 100 100">
                    <Defs>
                      <ClipPath id={`hexClip-${coin.symbol}`}>
                        <Polygon points="50,8 85,28 85,72 50,92 15,72 15,28" />
                      </ClipPath>
                    </Defs>
                    <Polygon
                      points="50,8 85,28 85,72 50,92 15,72 15,28"
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.15)"
                      strokeWidth="1.5"
                    />
                    <SvgImage
                      href={coin.image.uri || coin.image}
                      x="0"
                      y="5"
                      width="100"
                      height="90"
                      clipPath={`url(#hexClip-${coin.symbol})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </Svg>
                </View>

                <View style={styles.contentSection}>
                  {/* Coin Name & Symbol */}
                  <View style={styles.headerRow}>
                    <ThemedText type="defaultSemiBold" style={styles.coinName}>
                      {coin.name}
                    </ThemedText>
                    <View
                      style={[
                        styles.symbolBadge,
                        {
                          backgroundColor: `${coin.color}20`,
                          borderColor: `${coin.color}66`,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[styles.symbolText, { color: coin.color }]}
                      >
                        {coin.symbol}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Fiat Balance */}
                  <View style={styles.balanceRow}>
                    {isLoading ? (
                      <SkeletonLine width={140} height={24} />
                    ) : (
                      <Animated.Text
                        style={[styles.fiatAmount, { color: flashColor }]}
                      >
                        {hideBalance
                          ? "••••••"
                          : formatCurrency(
                              coin.fiatAmount || 0,
                              coin.fiatCurrency,
                            )}
                      </Animated.Text>
                    )}

                    {!isLoading && (
                      <TouchableOpacity
                        onPress={() => setHideBalance(!hideBalance)}
                        style={styles.eyeButton}
                      >
                        <Feather
                          name={hideBalance ? "eye-off" : "eye"}
                          size={18}
                          color="rgba(255, 255, 255, 0.6)"
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Coin Amount & 24h Change */}
                  <View style={styles.detailsRow}>
                    {isLoading ? (
                      <>
                        <SkeletonLine width={100} height={16} />
                        <SkeletonLine
                          width={80}
                          height={16}
                          style={{ marginLeft: 12 }}
                        />
                      </>
                    ) : (
                      <>
                        <ThemedText style={styles.coinAmount}>
                          {hideBalance
                            ? "••••••"
                            : `${coin.coinAmount} ${coin.symbol}`}
                        </ThemedText>

                        {coin.change24h !== undefined && (
                          <View
                            style={[
                              styles.changeBadge,
                              changeIsPositive
                                ? styles.changeBadgePositive
                                : styles.changeBadgeNegative,
                            ]}
                          >
                            <MaterialIcons
                              name={
                                changeIsPositive
                                  ? "trending-up"
                                  : "trending-down"
                              }
                              size={14}
                              color={changeIsPositive ? "#4ade80" : "#f87171"}
                            />
                            <ThemedText
                              style={[
                                styles.changeText,
                                {
                                  color: changeIsPositive
                                    ? "#4ade80"
                                    : "#f87171",
                                },
                              ]}
                            >
                              {hideBalance
                                ? "••••"
                                : `${changeIsPositive ? "+" : ""}${coin.change24h.toFixed(2)} ${coin.fiatCurrency}`}
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

      {/* Delete button - only visible when swiped */}
      <Animated.View
        style={[
          styles.deleteBackground,
          {
            opacity: translateX.interpolate({
              inputRange: [-80, 0],
              outputRange: [1, 0],
              extrapolate: "clamp",
            }),
          },
        ]}
      >
        <TouchableOpacity onPress={handleDelete} style={styles.deleteAction}>
          <MaterialIcons name="delete-outline" size={28} color="#ffffff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 12,
    position: "relative",
  },
  cardContainer: {
    position: "relative",
    zIndex: 2,
  },
  cardTouchable: {
    backgroundColor: "#121212",
    borderRadius: 16,
  },
  glassBackground: {
    backgroundColor: "rgba(30, 30, 30, 0.6)",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  gradientBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  cardContent: {
    padding: 14,
  },
  deleteBackground: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: "#f87171",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  deleteAction: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  contentSection: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  coinName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  symbolBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  symbolText: {
    fontSize: 11,
    fontWeight: "700",
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  fiatAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  eyeButton: {
    marginLeft: 8,
    padding: 4,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinAmount: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 10,
  },
  changeBadgePositive: {
    backgroundColor: "rgba(74, 222, 128, 0.1)",
  },
  changeBadgeNegative: {
    backgroundColor: "rgba(248, 113, 113, 0.1)",
  },
  changeText: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 3,
  },
});
