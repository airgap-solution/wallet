import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useFiat } from "@/contexts/FiatContext";

const fiatOptions = ["USD", "CAD", "EUR", "GBP", "JPY"];

export default function SettingsScreen() {
  const { fiat, setFiat } = useFiat();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.label}>
        Fiat Currency
      </ThemedText>

      <Pressable style={styles.selector} onPress={() => setModalVisible(true)}>
        <ThemedText>{fiat}</ThemedText>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={fiatOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    setFiat(item);
                    setModalVisible(false);
                  }}
                >
                  <ThemedText style={item === fiat ? styles.selected : {}}>
                    {item}
                  </ThemedText>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: "black" },
  label: { fontSize: 18, marginBottom: 12, color: "white" },
  selector: { padding: 16, borderRadius: 12, backgroundColor: "#1e1e1e" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    paddingVertical: 12,
  },
  option: { padding: 16 },
  selected: { fontWeight: "bold", color: "#4ade80" },
});
