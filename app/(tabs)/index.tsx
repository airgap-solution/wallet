import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FlatList,
  Modal,
  View,
  Pressable,
  Image,
  Animated,
  TextInput,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import CoinCard from "@/components/CoinCard";
import TransactionModal from "@/components/TransactionModal";
import TotalBalance from "@/components/TotalBalance";
import { SkeletonCoinCard } from "@/components/common/SkeletonLoader";

import { useAccounts } from "@/contexts/AccountsContext";
import { useFiat } from "@/contexts/FiatContext";
import { useAppSettings } from "@/contexts/AppSettingsContext";
import { useTheme } from "@/contexts/ThemeContext";

import { homeScreenStyles } from "@/styles/homeScreen.styles";
import { theme } from "@/theme";
import {
  COIN_META,
  getCoinMeta,
  cryptoApi,
  REFRESH_INTERVALS,
} from "@/constants/CoinMeta";
import { generateId, isEmpty } from "@/utils/formatters";
import { usePressAnimation } from "@/utils/animations";

import type { MappedAccount, BalanceApiResponse } from "@/types";

export default function HomeScreen() {
  const { accounts, addOrUpdateAccount, deleteAccount } = useAccounts();
  const { fiat } = useFiat();
  const { hideSmallBalances, smallBalanceThreshold, refreshInterval } =
    useAppSettings();
  const { theme: dynamicTheme } = useTheme();

  // State management
  const [allMappedAccounts, setAllMappedAccounts] = useState<MappedAccount[]>(
    [],
  );
  const [mappedAccounts, setMappedAccounts] = useState<MappedAccount[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<MappedAccount | null>(null);
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add account modal state
  const [addAccountModalVisible, setAddAccountModalVisible] = useState(false);
  const [newAccountType, setNewAccountType] =
    useState<keyof typeof COIN_META>("btc");
  const [newAccountXPub, setNewAccountXPub] = useState("");

  // Flag to prevent automatic reloads during account addition
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  // Refs and animations
  const silentRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modalScale = useRef(new Animated.Value(0)).current;
  const {
    animatedValue: buttonScale,
    animateIn,
    animateOut,
  } = usePressAnimation();

  // Pulse animation for floating button
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Start pulse animation
  useEffect(() => {
    const pulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    pulse();
  }, [pulseAnim]);

  // Modal animation
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
  }, [addAccountModalVisible, modalScale]);

  // Initialize empty cards for all accounts
  useEffect(() => {
    // Skip initialization if we're adding/deleting accounts
    if (isAddingAccount || isDeletingAccount) {
      return;
    }

    // Only run when accounts array actually changes (not just context updates)
    if (isEmpty(accounts)) {
      setAllMappedAccounts([]);
      setMappedAccounts([]);
      return;
    }

    // Only initialize if we don't have existing mapped accounts or if starting fresh
    if (allMappedAccounts.length === 0 || !hasInitialLoad) {
      const initialCards = accounts.map((acc): MappedAccount => {
        const meta = getCoinMeta(acc.Type);
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

      setAllMappedAccounts(initialCards);
      setMappedAccounts(initialCards);
    }
  }, [
    accounts,
    fiat,
    isAddingAccount,
    isDeletingAccount,
    allMappedAccounts.length,
    hasInitialLoad,
  ]);

  // Load balance data for a single account
  const loadSingleBalance = useCallback(
    async (acc: any): Promise<MappedAccount> => {
      const meta = getCoinMeta(acc.Type);
      const symbolForApi = acc.Type.split("_")[0].toUpperCase();

      try {
        const response = await cryptoApi.balanceGet(
          symbolForApi,
          acc.Wallet.XPub,
          fiat.toUpperCase(),
        );

        const data = response.data as BalanceApiResponse;

        return {
          id: acc.Wallet.XPub,
          name: meta.name,
          symbol: meta.symbol,
          image: meta.image,
          color: meta.color,
          fiatAmount: parseFloat((data.fiat_value ?? 0).toFixed(10)),
          coinAmount: parseFloat(Number(data.crypto_balance ?? 0).toFixed(10)),
          fiatCurrency: data.fiat_symbol ?? fiat,
          change24h: data.change24h ?? 0,
          raw: acc,
        };
      } catch (apiError) {
        console.warn(
          `Failed to fetch balance for ${acc.Wallet.XPub}:`,
          apiError,
        );

        // Return placeholder data on API failure
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
    },
    [fiat],
  );

  // Load balance data from API
  const loadBalances = useCallback(
    async (silent = false) => {
      // Skip loading if we're in the middle of account operations
      if (isDeletingAccount || isAddingAccount) return;

      if (!silent) {
        setRefreshing(true);
      }

      try {
        const results = await Promise.all(
          accounts.map((acc) => loadSingleBalance(acc)),
        );

        // Sort by fiat amount (highest first)
        results.sort((a, b) => (b.fiatAmount ?? 0) - (a.fiatAmount ?? 0));

        // Store unfiltered results
        setAllMappedAccounts(results);

        // Apply current filter settings
        const filteredResults = hideSmallBalances
          ? results.filter(
              (account) => (account.fiatAmount ?? 0) >= smallBalanceThreshold,
            )
          : results;

        setMappedAccounts(filteredResults);
        setError(null);
      } catch (err) {
        console.error("Failed to load balances:", err);
        setError("Failed to load account balances");
      } finally {
        setRefreshing(false);
        setHasInitialLoad(true);
      }
    },
    [
      accounts,
      hideSmallBalances,
      smallBalanceThreshold,
      loadSingleBalance,
      isDeletingAccount,
      isAddingAccount,
    ],
  );

  // Silent refresh that preserves existing data and only updates values
  const silentRefreshBalances = useCallback(async () => {
    if (isDeletingAccount || isAddingAccount) return;

    try {
      const results = await Promise.all(
        accounts.map((acc) => loadSingleBalance(acc)),
      );

      // Update existing accounts without changing their loading state
      setAllMappedAccounts((prev) => {
        const updated = prev.map((existing) => {
          const newData = results.find((result) => result.id === existing.id);
          return newData ? newData : existing;
        });

        updated.sort((a, b) => (b.fiatAmount ?? 0) - (a.fiatAmount ?? 0));
        return updated;
      });

      setMappedAccounts((prev) => {
        const updated = prev.map((existing) => {
          const newData = results.find((result) => result.id === existing.id);
          return newData ? newData : existing;
        });

        const filtered = hideSmallBalances
          ? updated.filter(
              (account) => (account.fiatAmount ?? 0) >= smallBalanceThreshold,
            )
          : updated;

        filtered.sort((a, b) => (b.fiatAmount ?? 0) - (a.fiatAmount ?? 0));
        return filtered;
      });

      setError(null);
    } catch (err) {
      console.error("Failed to refresh balances:", err);
    }
  }, [
    accounts,
    hideSmallBalances,
    smallBalanceThreshold,
    loadSingleBalance,
    isDeletingAccount,
    isAddingAccount,
  ]);

  // Load balances when accounts are first loaded
  useEffect(() => {
    if (
      !isEmpty(accounts) &&
      !hasInitialLoad &&
      !isDeletingAccount &&
      !isAddingAccount
    ) {
      loadBalances();
    }
  }, [
    loadBalances,
    hasInitialLoad,
    accounts,
    isDeletingAccount,
    isAddingAccount,
  ]);

  // Trigger initial load when accounts change from empty to having items
  useEffect(() => {
    if (
      !isEmpty(accounts) &&
      allMappedAccounts.length === 0 &&
      !isDeletingAccount &&
      !isAddingAccount
    ) {
      loadBalances();
    }
  }, [
    accounts.length,
    loadBalances,
    allMappedAccounts.length,
    isDeletingAccount,
    accounts,
    isAddingAccount,
  ]);

  // Load balances when fiat currency changes (for existing accounts)
  useEffect(() => {
    if (
      !isEmpty(accounts) &&
      hasInitialLoad &&
      !isDeletingAccount &&
      !isAddingAccount
    ) {
      silentRefreshBalances();
    }
  }, [
    silentRefreshBalances,
    fiat,
    hasInitialLoad,
    accounts,
    isDeletingAccount,
    isAddingAccount,
  ]);

  // Setup auto-refresh interval
  useEffect(() => {
    if (!isEmpty(accounts) && !isDeletingAccount && !isAddingAccount) {
      const getRefreshInterval = () => {
        switch (refreshInterval) {
          case "5s":
            return 5000;
          case "10s":
            return 10000;
          case "30s":
            return 30000;
          case "1m":
            return 60000;
          case "5m":
            return 300000;
          default:
            return REFRESH_INTERVALS.NORMAL;
        }
      };

      silentRefreshRef.current = setInterval(
        () => silentRefreshBalances(),
        getRefreshInterval(),
      );
    }

    return () => {
      if (silentRefreshRef.current) {
        clearInterval(silentRefreshRef.current);
      }
    };
  }, [
    silentRefreshBalances,
    accounts,
    isDeletingAccount,
    isAddingAccount,
    refreshInterval,
  ]);

  // Apply filter when settings change
  useEffect(() => {
    if (allMappedAccounts.length > 0) {
      const filteredResults = hideSmallBalances
        ? allMappedAccounts.filter(
            (account) => (account.fiatAmount ?? 0) >= smallBalanceThreshold,
          )
        : allMappedAccounts;

      setMappedAccounts(filteredResults);
    }
  }, [hideSmallBalances, smallBalanceThreshold, allMappedAccounts]);

  // Handlers
  const handleDeleteAccount = useCallback(
    (xpub: string) => {
      // Prevent multiple rapid deletions
      if (isDeletingAccount) return;

      setIsDeletingAccount(true);

      // Remove from UI immediately
      setAllMappedAccounts((prev) =>
        prev.filter((account) => account.raw?.Wallet?.XPub !== xpub),
      );
      setMappedAccounts((prev) =>
        prev.filter((account) => account.raw?.Wallet?.XPub !== xpub),
      );

      // Remove from context
      deleteAccount(xpub);

      setTimeout(() => {
        setIsDeletingAccount(false);
      }, 100);
    },
    [deleteAccount, isDeletingAccount],
  );

  const handleAddAccount = useCallback(async () => {
    if (isEmpty(newAccountXPub.trim())) return;

    // Prevent multiple rapid additions
    if (isAddingAccount) return;

    const xpub = newAccountXPub.trim();

    // Check for duplicates in current state
    const existingAccount = allMappedAccounts.find(
      (account) => account.raw?.Wallet?.XPub === xpub,
    );

    if (existingAccount) {
      console.log("⚠️ Account already exists, skipping...");
      setNewAccountXPub("");
      setNewAccountType("btc");
      setAddAccountModalVisible(false);
      return;
    }

    setIsAddingAccount(true);

    const newAccount = {
      ID: generateId(),
      Index: 0,
      Type: newAccountType as string,
      Block: 0,
      Wallet: {
        XPub: xpub,
        DerivationPath: "",
        ChainCode: "",
        Name: "",
        Internal1: false,
        Internal2: false,
        SomeBytes: "",
      },
    };

    // Create placeholder entry with loading state
    const meta = getCoinMeta(newAccount.Type);
    const placeholder: MappedAccount = {
      id: newAccount.Wallet.XPub,
      name: meta.name,
      symbol: meta.symbol,
      image: meta.image,
      color: meta.color,
      fiatAmount: null, // null indicates loading
      coinAmount: null,
      fiatCurrency: fiat,
      change24h: null,
      raw: newAccount,
    };

    // Add placeholder to UI immediately
    setAllMappedAccounts((prev) => [...prev, placeholder]);
    setMappedAccounts((prev) => {
      const updated = [...prev, placeholder];
      return hideSmallBalances
        ? updated.filter(
            (account) => (account.fiatAmount ?? 0) >= smallBalanceThreshold,
          )
        : updated;
    });

    // Close modal immediately
    setNewAccountXPub("");
    setNewAccountType("btc");
    setAddAccountModalVisible(false);

    // Add account to context
    try {
      await addOrUpdateAccount(newAccount);

      // Fetch balance for ONLY this new account in background
      const newAccountData = await loadSingleBalance(newAccount);
      setAllMappedAccounts((prev) =>
        prev.map((account) =>
          account.id === newAccount.Wallet.XPub ? newAccountData : account,
        ),
      );
      setMappedAccounts((prev) => {
        const updated = prev.map((account) =>
          account.id === newAccount.Wallet.XPub ? newAccountData : account,
        );
        return hideSmallBalances
          ? updated.filter(
              (account) => (account.fiatAmount ?? 0) >= smallBalanceThreshold,
            )
          : updated;
      });
    } catch (error) {
      console.error("Failed to add account:", error);
    } finally {
      setIsAddingAccount(false);
    }
  }, [
    newAccountXPub,
    newAccountType,
    allMappedAccounts,
    addOrUpdateAccount,
    fiat,
    loadSingleBalance,
    hideSmallBalances,
    smallBalanceThreshold,
    isAddingAccount,
  ]);

  const handleCoinPress = useCallback((coin: MappedAccount) => {
    setSelectedCoin(coin);
    setTransactionModalVisible(true);
  }, []);

  const handleRetry = useCallback(() => {
    loadBalances(false);
  }, [loadBalances]);

  const handlePullToRefresh = useCallback(() => {
    if (isDeletingAccount || isAddingAccount) return;
    silentRefreshBalances();
  }, [silentRefreshBalances, isDeletingAccount, isAddingAccount]);

  // Calculate portfolio totals
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

  // Check if we're hiding any accounts due to small balance filter
  const hiddenAccountsCount = hideSmallBalances
    ? allMappedAccounts.length - mappedAccounts.length
    : 0;

  // Render functions
  const renderCoinCard = useCallback(
    ({ item }: { item: MappedAccount }) => (
      <CoinCard
        coin={item}
        onPress={() => handleCoinPress(item)}
        onDelete={handleDeleteAccount}
      />
    ),
    [handleCoinPress, handleDeleteAccount],
  );

  const renderEmptyState = () => (
    <View style={homeScreenStyles.emptyState}>
      <MaterialIcons
        name="account-balance-wallet"
        size={theme.dimensions.iconSize.xxl}
        color={theme.colors.text.tertiary}
      />
      <ThemedText style={homeScreenStyles.emptyStateText}>
        {hideSmallBalances && allMappedAccounts.length > 0
          ? `All ${allMappedAccounts.length} accounts are hidden due to small balance filter.`
          : "No accounts added yet.\nTap the + button to add your first cryptocurrency account."}
      </ThemedText>
      {hideSmallBalances && allMappedAccounts.length > 0 && (
        <ThemedText style={homeScreenStyles.emptyStateSubtext}>
          Accounts with balances under {smallBalanceThreshold} {fiat} are
          hidden. Adjust this in Settings.
        </ThemedText>
      )}
    </View>
  );

  const renderLoadingState = () => (
    <View style={homeScreenStyles.loadingContainer}>
      {Array.from({ length: 3 }).map((_, index) => (
        <SkeletonCoinCard key={index} />
      ))}
    </View>
  );

  const renderError = () => (
    <View style={homeScreenStyles.errorContainer}>
      <MaterialIcons
        name="error-outline"
        size={theme.dimensions.iconSize.lg}
        color={theme.colors.error}
      />
      <ThemedText style={homeScreenStyles.errorText}>{error}</ThemedText>
      <Pressable onPress={handleRetry} style={homeScreenStyles.retryButton}>
        <ThemedText style={homeScreenStyles.retryButtonText}>Retry</ThemedText>
      </Pressable>
    </View>
  );

  const insets = useSafeAreaInsets();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView
        style={[
          homeScreenStyles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        {error ? (
          renderError()
        ) : isEmpty(accounts) ? (
          renderEmptyState()
        ) : isLoading && isEmpty(mappedAccounts) ? (
          renderLoadingState()
        ) : isEmpty(mappedAccounts) && hideSmallBalances ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={mappedAccounts}
            keyExtractor={(item) => item.id}
            renderItem={renderCoinCard}
            refreshing={refreshing}
            onRefresh={handlePullToRefresh}
            contentContainerStyle={homeScreenStyles.listContainer}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            bounces={true}
            alwaysBounceVertical={true}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
            ListHeaderComponent={
              <View>
                <TotalBalance
                  total={totalFiat}
                  changePercent={totalPercentChange}
                  fiat={fiat}
                  isLoading={isLoading && !hasInitialLoad}
                />
                {hiddenAccountsCount > 0 && (
                  <View style={homeScreenStyles.filterNotification}>
                    <MaterialIcons
                      name="visibility-off"
                      size={16}
                      color={theme.colors.text.tertiary}
                    />
                    <ThemedText style={homeScreenStyles.filterNotificationText}>
                      {hiddenAccountsCount} account
                      {hiddenAccountsCount > 1 ? "s" : ""} hidden (balance under{" "}
                      {smallBalanceThreshold} {fiat})
                    </ThemedText>
                  </View>
                )}
              </View>
            }
          />
        )}

        {/* Floating Add Button */}
        <Animated.View
          style={{
            transform: [{ scale: buttonScale }, { scale: pulseAnim }],
          }}
        >
          <Pressable
            onPress={() => setAddAccountModalVisible(true)}
            onPressIn={animateIn}
            onPressOut={animateOut}
            style={({ pressed }) => [
              homeScreenStyles.floatingButton,
              pressed && homeScreenStyles.floatingButtonPressed,
            ]}
          >
            <LinearGradient
              colors={dynamicTheme.colors.gradients.primary as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={homeScreenStyles.floatingButtonGradient}
            >
              <MaterialIcons
                name="add"
                size={32}
                color={theme.colors.text.primary}
              />
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Transaction Modal */}
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
            style={homeScreenStyles.modalOverlay}
            onPress={() => setAddAccountModalVisible(false)}
          >
            <Pressable onPress={() => {}}>
              <Animated.View
                style={[
                  homeScreenStyles.modalContent,
                  { transform: [{ scale: modalScale }] },
                ]}
              >
                {/* Header */}
                <View style={homeScreenStyles.modalHeader}>
                  <ThemedText style={homeScreenStyles.modalTitle}>
                    Add Account
                  </ThemedText>
                  <Pressable
                    onPress={() => setAddAccountModalVisible(false)}
                    style={homeScreenStyles.closeButton}
                  >
                    <MaterialIcons
                      name="close"
                      size={24}
                      color={theme.colors.text.secondary}
                    />
                  </Pressable>
                </View>

                {/* Coin Selector */}
                <ThemedText style={homeScreenStyles.sectionLabel}>
                  Select Cryptocurrency
                </ThemedText>
                <View style={homeScreenStyles.coinSelector}>
                  {Object.entries(COIN_META).map(([key, meta]) => {
                    const selected = key === newAccountType;
                    return (
                      <Pressable
                        key={key}
                        onPress={() =>
                          setNewAccountType(key as keyof typeof COIN_META)
                        }
                        style={[
                          homeScreenStyles.coinOption,
                          selected && homeScreenStyles.coinOptionSelected,
                        ]}
                      >
                        <Image
                          source={meta.image}
                          style={homeScreenStyles.coinOptionImage}
                        />
                        <ThemedText
                          style={[
                            homeScreenStyles.coinOptionText,
                            selected && homeScreenStyles.coinOptionTextSelected,
                          ]}
                        >
                          {meta.name}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Input */}
                <ThemedText style={homeScreenStyles.sectionLabel}>
                  Address / XPub
                </ThemedText>
                <View
                  style={[
                    homeScreenStyles.inputContainer,
                    inputFocused && homeScreenStyles.inputContainerFocused,
                  ]}
                >
                  <MaterialIcons
                    name="account-balance-wallet"
                    size={20}
                    color={
                      inputFocused ? "#6366f1" : theme.colors.text.tertiary
                    }
                    style={homeScreenStyles.inputIcon}
                  />
                  <TextInput
                    style={homeScreenStyles.input}
                    value={newAccountXPub}
                    onChangeText={setNewAccountXPub}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Enter XPub or Address"
                    placeholderTextColor={theme.colors.text.tertiary}
                    multiline={true}
                    numberOfLines={2}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                {/* Actions */}
                <View style={homeScreenStyles.modalActions}>
                  <Pressable
                    onPress={() => setAddAccountModalVisible(false)}
                    style={homeScreenStyles.cancelButton}
                  >
                    <ThemedText style={homeScreenStyles.cancelButtonText}>
                      Cancel
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={handleAddAccount}
                    style={[
                      homeScreenStyles.confirmButton,
                      (isEmpty(newAccountXPub) || isAddingAccount) &&
                        homeScreenStyles.confirmButtonDisabled,
                    ]}
                    disabled={isEmpty(newAccountXPub) || isAddingAccount}
                  >
                    <LinearGradient
                      colors={
                        !isEmpty(newAccountXPub) && !isAddingAccount
                          ? (dynamicTheme.colors.gradients.primary as any)
                          : (["#444", "#444"] as any)
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={homeScreenStyles.confirmButtonGradient}
                    >
                      <ThemedText style={homeScreenStyles.confirmButtonText}>
                        {isAddingAccount ? "Adding..." : "Add Account"}
                      </ThemedText>
                    </LinearGradient>
                  </Pressable>
                </View>
              </Animated.View>
            </Pressable>
          </Pressable>
        </Modal>
      </ThemedView>
    </GestureHandlerRootView>
  );
}
