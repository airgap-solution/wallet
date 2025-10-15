// Coin metadata and API configuration constants
import { DefaultApi, Configuration } from "@airgap-solution/crypto-wallet-rest";
import type { CoinMetaMap } from "@/types";

/**
 * Cryptocurrency metadata configuration
 */
export const COIN_META: CoinMetaMap = {
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
  sol: {
    name: "Solana",
    symbol: "SOL",
    image: require("@/assets/coins/sol.png"), // TODO: Replace with official Solana icon
    color: "#9945FF",
  },
};

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: "https://api.cwr.restartfu.com",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

/**
 * Pre-configured API instance
 */
export const cryptoApi = new DefaultApi(
  new Configuration({
    basePath: API_CONFIG.BASE_URL,
  }),
);

/**
 * Supported cryptocurrency types
 */
export const SUPPORTED_COINS = Object.keys(
  COIN_META,
) as (keyof typeof COIN_META)[];

/**
 * Default coin metadata for unknown coins
 */
export const DEFAULT_COIN_META = {
  name: "Unknown",
  symbol: "???",
  image: require("@/assets/coins/btc.png"), // Fallback to BTC image
  color: "#8b5cf6", // Purple fallback color
};

/**
 * Get coin metadata with fallback
 */
export const getCoinMeta = (coinType: string) => {
  const normalizedType = coinType.split("_")[0].toLowerCase();
  return (
    COIN_META[normalizedType] || {
      ...DEFAULT_COIN_META,
      name: coinType,
      symbol: coinType.split("_")[0].toUpperCase(),
    }
  );
};

/**
 * Refresh intervals (in milliseconds)
 */
export const REFRESH_INTERVALS = {
  MANUAL: 0,
  FAST: 30_000, // 30 seconds
  NORMAL: 60_000, // 1 minute
  SLOW: 300_000, // 5 minutes
};

/**
 * Default settings
 */
export const DEFAULT_SETTINGS = {
  AUTO_REFRESH: true,
  REFRESH_INTERVAL: REFRESH_INTERVALS.NORMAL,
  HIDE_BALANCES: false,
  NOTIFICATIONS: true,
  BIOMETRIC_AUTH: false,
};
