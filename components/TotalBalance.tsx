import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";

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

export default function TotalBalance({
  total,
  changePercent,
  fiat,
}: TotalBalanceProps) {
  const [hide, setHide] = useState(false);
  const color = changePercent >= 0 ? "#4ade80" : "#f87171";
  const sign = changePercent >= 0 ? "↑" : "↓";

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <ThemedText type="title" style={styles.balance}>
          {hide ? "****" : formatCurrency(total, fiat)}
        </ThemedText>
        <TouchableOpacity
          onPress={() => setHide(!hide)}
          style={{ marginLeft: 8 }}
        >
          <Feather name={hide ? "eye-off" : "eye"} size={24} color="white" />
        </TouchableOpacity>
      </View>
      <ThemedText style={[styles.change, { color }]}>
        {sign} {Math.abs(changePercent).toFixed(2)}% today
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginBottom: 24 },
  balance: { fontSize: 32, fontWeight: "bold", color: "white" },
  change: { fontSize: 16 },
});
