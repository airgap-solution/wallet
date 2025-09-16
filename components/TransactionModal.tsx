import React from "react";
import { View, FlatList, Modal, Pressable, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";

export default function TransactionModal({ visible, onClose, coin }: any) {
  if (!coin) return null;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={() => {}}>
          <View style={styles.header}>
            <ThemedText type="title" style={{ fontSize: 24 }}>
              {coin.name} ({coin.symbol})
            </ThemedText>
            <ThemedText style={{ fontSize: 20, marginTop: 4 }}>
              {coin.fiatAmountFormatted} • {coin.coinAmount}
            </ThemedText>
            <Pressable
              style={{ position: "absolute", right: 16, top: 16 }}
              onPress={onClose}
            >
              <MaterialIcons name="close" size={28} color="white" />
            </Pressable>
          </View>
          <FlatList
            data={coin.transactions || []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => (
              <View style={styles.transactionRow}>
                <MaterialIcons
                  name={
                    item.type === "received" ? "arrow-downward" : "arrow-upward"
                  }
                  size={24}
                  color={item.type === "received" ? "#4ade80" : "#f87171"}
                />
                <View style={{ marginLeft: 12 }}>
                  <ThemedText style={{ color: "white" }}>
                    {item.amount}
                  </ThemedText>
                  <ThemedText style={{ color: "gray", fontSize: 12 }}>
                    {item.date}
                  </ThemedText>
                </View>
              </View>
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1e1e1e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    padding: 16,
  },
  header: { alignItems: "center", marginBottom: 16 },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#333",
  },
});
