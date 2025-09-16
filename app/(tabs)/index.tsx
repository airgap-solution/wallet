import React, { useState, useEffect, useRef } from "react";
import { FlatList } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ThemedView } from "@/components/ThemedView";
import CoinCard from "@/components/CoinCard";
import TransactionModal from "@/components/TransactionModal";
import TotalBalance from "@/components/TotalBalance";
import { useAccounts } from "@/contexts/AccountsContext";
import { useFiat } from "@/contexts/FiatContext";

import {
  DefaultApi,
  Configuration,
} from "@airgap-solution/crypto-balance-rest-client";

const coinMeta: Record<string, { name: string; symbol: string; image: any }> = {
  btc: {
    name: "Bitcoin",
    symbol: "BTC",
    image: require("@/assets/coins/btc.png"),
  },
  eth: {
    name: "Ethereum",
    symbol: "ETH",
    image: require("@/assets/coins/eth.png"),
  },
  kas: {
    name: "Kaspa",
    symbol: "KAS",
    image: require("@/assets/coins/kas.png"),
  },
};

const apiConfig = new Configuration({ basePath: "https://restartfu.com" });
const api = new DefaultApi(apiConfig);

export default function HomeScreen() {
  const { accounts, addOrUpdateAccount, clearAccounts } = useAccounts();
  const { fiat } = useFiat();
  const [mappedAccounts, setMappedAccounts] = useState<any[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fixed type for React Native environment
  const silentRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadBalances = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const results = await Promise.all(
        accounts.map(async (acc) => {
          const meta = coinMeta[acc.Type] || {
            name: acc.Type,
            symbol: acc.Type.slice(0, 3).toUpperCase(),
            image: require("@/assets/coins/btc.png"),
          };
          try {
            const res = await api.balanceGet(
              acc.Wallet.XPub,
              acc.Type,
              fiat.toLowerCase(),
            );
            const fiatValue = res.data?.value ?? 0;
            const coinValue = res.data?.balance ?? "0";
            const change24h = res.data?.change24h ?? 0;

            return {
              id: acc.Wallet.XPub,
              name: meta.name,
              symbol: meta.symbol,
              image: meta.image,
              fiatAmount: parseFloat(fiatValue.toFixed(2)),
              coinAmount: coinValue,
              fiatCurrency: fiat,
              change24h: parseFloat(change24h.toFixed(2)),
              raw: acc,
            };
          } catch (e) {
            console.error("Failed to fetch balance for", acc.Wallet.XPub, e);
            return {
              id: acc.Wallet.XPub,
              name: meta.name,
              symbol: meta.symbol,
              image: meta.image,
              fiatAmount: 0,
              coinAmount: "0",
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

  // silent auto-refresh every minute
  useEffect(() => {
    silentRefreshRef.current = setInterval(() => {
      loadBalances(true);
    }, 60_000);

    return () => {
      if (silentRefreshRef.current) clearInterval(silentRefreshRef.current);
    };
  }, [accounts, fiat]);

  const handleDelete = (xpub: string) => {
    const filtered = accounts.filter((a) => a.Wallet.XPub !== xpub);
    clearAccounts();
    filtered.forEach((a) => addOrUpdateAccount(a));
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
      <ThemedView
        style={{
          flex: 1,
          paddingHorizontal: 16,
          paddingTop: 48,
          backgroundColor: "black",
        }}
      >
        <TotalBalance
          total={totalFiat}
          changePercent={totalPercentChange}
          fiat={fiat}
        />
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
        />
        <TransactionModal
          visible={transactionModalVisible}
          onClose={() => setTransactionModalVisible(false)}
          coin={selectedCoin}
        />
      </ThemedView>
    </GestureHandlerRootView>
  );
}
