import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);

export default function CoinCard({ coin, onPress, onDelete }: any) {
  const [hideBalance, setHideBalance] = useState(false);
  const prevFiat = useRef<number | null>(null);
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (prevFiat.current !== null && coin.fiatAmount !== prevFiat.current) {
      flashAnim.setValue(0);
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start(() => flashAnim.setValue(0)); // reset after animation
    }
    prevFiat.current = coin.fiatAmount;
  }, [coin.fiatAmount]);

  const flashColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      "white",
      coin.fiatAmount > (prevFiat.current || 0) ? "#4ade80" : "#f87171",
    ],
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Image
          source={coin.image}
          style={{ width: 48, height: 48, borderRadius: 12 }}
          resizeMode="contain"
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            {coin.name} ({coin.symbol})
          </ThemedText>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Animated.Text style={[styles.fiatAmount, { color: flashColor }]}>
              {hideBalance
                ? "****"
                : formatCurrency(coin.fiatAmount || 0, coin.fiatCurrency)}
            </Animated.Text>
            <TouchableOpacity
              onPress={() => setHideBalance(!hideBalance)}
              style={{ marginLeft: 8 }}
            >
              <Feather
                name={hideBalance ? "eye-off" : "eye"}
                size={20}
                color="white"
              />
            </TouchableOpacity>
          </View>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
          >
            <ThemedText style={styles.coinAmount}>
              {hideBalance ? "****" : coin.coinAmount}
            </ThemedText>
            {coin.change24h !== undefined && (
              <ThemedText
                style={{
                  marginLeft: 8,
                  color: coin.change24h >= 0 ? "#4ade80" : "#f87171",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                {coin.change24h >= 0 ? "+" : ""}
                {coin.change24h.toFixed(2)} {coin.fiatCurrency} (24h)
              </ThemedText>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={() => onDelete(coin.raw.Wallet.XPub)}>
          <MaterialIcons name="delete" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  row: { flexDirection: "row", alignItems: "center" },
  cardTitle: { marginBottom: 4, color: "white", fontSize: 16 },
  fiatAmount: { fontSize: 20, fontWeight: "bold", color: "white" },
  coinAmount: { fontSize: 14, color: "gray" },
});
