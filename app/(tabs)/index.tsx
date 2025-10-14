import React, { useState, useEffect, useRef } from "react";
import {
  FlatList,
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  StyleSheet,
  Animated,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemedView } from "@/components/ThemedView";
import CoinCard from "@/components/CoinCard";
import TransactionModal from "@/components/TransactionModal";
import TotalBalance from "@/components/TotalBalance";
import { useAccounts } from "@/contexts/AccountsContext";
import { useFiat } from "@/contexts/FiatContext";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { DefaultApi, Configuration } from "@airgap-solution/crypto-wallet-rest";

const coinMeta: Record<
  string,
  { name: string; symbol: string; image: any; color: string }
> = {
  btc: {
    name: "Bitcoin",
    symbol: "BTC",
    image: require("@/assets/coins/btc.png"),
    color: "#F7931A",
  },
  eth: {
    name: "Ethereum",
    symbol: "ETH",
    image: require("@/assets/coins/eth.png"),
    color: "#627EEA",
  },
  kas: {
    name: "Kaspa",
    symbol: "KAS",
    image: require("@/assets/coins/kas.png"),
    color: "#70C7BA",
  },
};

const api = new DefaultApi(
  new Configuration({ basePath: "https://api.cwr.restartfu.com" }),
);

export default function HomeScreen() {
  const { accounts, addOrUpdateAccount, clearAccounts } = useAccounts();
  const { fiat } = useFiat();

  const [mappedAccounts, setMappedAccounts] = useState<any[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const silentRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [addAccountModalVisible, setAddAccountModalVisible] = useState(false);
  const [newAccountType, setNewAccountType] =
    useState<keyof typeof coinMeta>("btc");
  const [newAccountXPub, setNewAccountXPub] = useState("");

  const modalScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (addAccountModalVisible) {
      Animated.spring(modalScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      modalScale.setValue(0);
    }
  }, [addAccountModalVisible]);

  /** show cards instantly for all accounts, even if price not yet fetched */
  useEffect(() => {
    const initial = accounts.map((acc) => {
      const symbolForApi = acc.Type.split("_")[0].toUpperCase();
      const meta = coinMeta[symbolForApi.toLowerCase()] || {
        name: acc.Type,
        symbol: symbolForApi,
        image: require("@/assets/coins/btc.png"),
        color: "#8b5cf6",
      };
      return {
        id: acc.Wallet.XPub,
        name: meta.name,
        symbol: meta.symbol,
        image: meta.image,
        color: meta.color,
        fiatAmount: null,
        coinAmount: null,
        fiatCurrency: fiat,
        change24h: null,
        raw: acc,
      };
    });
    setMappedAccounts(initial);
  }, [accounts, fiat]);

  const loadBalances = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const results = await Promise.all(
        accounts.map(async (acc) => {
          const symbolForApi = acc.Type.split("_")[0].toUpperCase();
          const meta = coinMeta[symbolForApi.toLowerCase()] || {
            name: acc.Type,
            symbol: symbolForApi,
            image: require("@/assets/coins/btc.png"),
            color: "#8b5cf6",
          };

          try {
            const res = await api.balanceGet(
              symbolForApi,
              acc.Wallet.XPub,
              fiat.toUpperCase(),
            );
            const data = res.data;

            const fiatValue = data.fiat_value ?? 0;
            const coinValue = data.crypto_balance ?? 0;

            return {
              id: acc.Wallet.XPub,
              name: meta.name,
              symbol: meta.symbol,
              image: meta.image,
              color: meta.color,
              fiatAmount: parseFloat(fiatValue.toFixed(10)),
              coinAmount: parseFloat(Number(coinValue).toFixed(10)),
              fiatCurrency: data.fiat_symbol ?? fiat,
              change24h: data.change24h,
              raw: acc,
            };
          } catch {
            // keep placeholders if request fails
            return {
              id: acc.Wallet.XPub,
              name: meta.name,
              symbol: meta.symbol,
              image: meta.image,
              color: meta.color,
              fiatAmount: 0,
              coinAmount: 0,
              fiatCurrency: fiat,
              change24h: 0,
              raw: acc,
            };
          }
        }),
      );

      results.sort((a, b) => (b.fiatAmount ?? 0) - (a.fiatAmount ?? 0));
      setMappedAccounts(results);
    } finally {
      if (!silent) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBalances();
  }, [accounts, fiat]);

  useEffect(() => {
    silentRefreshRef.current = setInterval(() => loadBalances(true), 60_000);
    return () =>
      silentRefreshRef.current && clearInterval(silentRefreshRef.current);
  }, [accounts, fiat]);

  const handleDelete = (xpub: string) => {
    const filtered = accounts.filter((a) => a.Wallet.XPub !== xpub);
    clearAccounts();
    filtered.forEach((a) => addOrUpdateAccount(a));
  };

  const handleAddAccount = () => {
    if (!newAccountXPub) return;
    addOrUpdateAccount({
      Type: newAccountType,
      Wallet: {
        XPub: newAccountXPub,
        DerivationPath: "",
        ChainCode: "",
        Name: "",
        Internal1: "",
        Internal2: "",
      },
    });
    setNewAccountXPub("");
    setNewAccountType("btc");
    setAddAccountModalVisible(false);
  };

  const totalFiat = mappedAccounts.reduce(
    (acc, curr) => acc + (curr.fiatAmount ?? 0),
    0,
  );
  const totalChangeFiat = mappedAccounts.reduce(
    (acc, curr) => acc + (curr.change24h ?? 0),
    0,
  );
  const totalPercentChange = totalFiat
    ? (totalChangeFiat / totalFiat) * 100
    : 0;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <TotalBalance
          total={totalFiat}
          changePercent={totalPercentChange}
          fiat={fiat}
        />

        {/* Show all cards (even if price missing) */}
        <FlatList
          data={mappedAccounts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CoinCard
              coin={item}
              onPress={() => {
                setSelectedCoin(item);
                setTransactionModalVisible(true);
              }}
              onDelete={handleDelete}
            />
          )}
          refreshing={refreshing}
          onRefresh={() => loadBalances(false)}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        {/* Floating Add Button */}
        <Pressable
          onPress={() => setAddAccountModalVisible(true)}
          style={({ pressed }) => [
            styles.floatingButton,
            pressed && styles.floatingButtonPressed,
          ]}
        >
          <LinearGradient
            colors={["#8b5cf6", "#3b82f6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.floatingButtonGradient}
          >
            <MaterialIcons name="add" size={32} color="#fff" />
          </LinearGradient>
        </Pressable>

        <TransactionModal
          visible={transactionModalVisible}
          onClose={() => setTransactionModalVisible(false)}
          coin={selectedCoin}
        />

        {/* Add Account Modal */}
        <Modal
          visible={addAccountModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAddAccountModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setAddAccountModalVisible(false)}
          >
            <Animated.View
              style={[
                styles.modalContent,
                { transform: [{ scale: modalScale }] },
              ]}
              onStartShouldSetResponder={() => true}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Account</Text>
                <Pressable
                  onPress={() => setAddAccountModalVisible(false)}
                  style={styles.closeButton}
                >
                  <MaterialIcons
                    name="close"
                    size={24}
                    color="rgba(255, 255, 255, 0.7)"
                  />
                </Pressable>
              </View>

              {/* Coin Selector */}
              <Text style={styles.sectionLabel}>Select Cryptocurrency</Text>
              <View style={styles.coinSelector}>
                {Object.entries(coinMeta).map(([key, meta]) => {
                  const selected = key === newAccountType;
                  return (
                    <Pressable
                      key={key}
                      onPress={() =>
                        setNewAccountType(key as keyof typeof coinMeta)
                      }
                      style={[
                        styles.coinOption,
                        selected && styles.coinOptionSelected,
                      ]}
                    >
                      <Image
                        source={meta.image}
                        style={styles.coinOptionImage}
                      />
                      <Text
                        style={[
                          styles.coinOptionText,
                          selected && styles.coinOptionTextSelected,
                        ]}
                      >
                        {meta.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Input */}
              <Text style={styles.sectionLabel}>Address / XPub</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="account-balance-wallet"
                  size={20}
                  color="rgba(255, 255, 255, 0.4)"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter XPub or Address"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  value={newAccountXPub}
                  onChangeText={setNewAccountXPub}
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setAddAccountModalVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddAccount}
                  style={[
                    styles.confirmButton,
                    !newAccountXPub && styles.confirmButtonDisabled,
                  ]}
                  disabled={!newAccountXPub}
                >
                  <LinearGradient
                    colors={
                      newAccountXPub ? ["#8b5cf6", "#3b82f6"] : ["#444", "#444"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.confirmButtonGradient}
                  >
                    <Text style={styles.confirmButtonText}>Add Account</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </Animated.View>
          </Pressable>
        </Modal>
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
    backgroundColor: "#121212",
  },
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    elevation: 8,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  floatingButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  floatingButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "rgba(30, 30, 30, 0.95)",
    borderRadius: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  sectionLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  coinSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  coinOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  coinOptionSelected: {
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderColor: "rgba(139, 92, 246, 0.5)",
  },
  coinOptionImage: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  coinOptionText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
    fontSize: 14,
  },
  coinOptionTextSelected: {
    color: "#a78bfa",
    fontWeight: "700",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 14,
    color: "#fff",
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cancelButtonText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 15,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
