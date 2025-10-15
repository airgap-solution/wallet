// Utility functions for formatting and common operations

export type NumberFormat = "default" | "compact" | "scientific";

/**
 * Format a number as currency with proper locale and number format support
 */
export const formatCurrency = (
  amount: number,
  currency: string,
  locale: string = "en-CA",
  format: NumberFormat = "default",
): string => {
  switch (format) {
    case "compact":
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        notation: "compact",
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }).format(amount);

    case "scientific":
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        notation: "scientific",
        maximumFractionDigits: 3,
        minimumFractionDigits: 0,
      }).format(amount);

    default:
      // For very large amounts in default mode, use compact notation
      if (amount >= 1e6) {
        return new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          notation: "compact",
          maximumFractionDigits: 3,
          minimumFractionDigits: 0,
        }).format(amount);
      }

      // For smaller amounts, use standard formatting
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(amount);
  }
};

/**
 * Format cryptocurrency amount with proper decimal places and number format support
 */
export const formatCryptoAmount = (
  amount: number | string,
  symbol: string,
  maxDecimals: number = 8,
  format: NumberFormat = "default",
): string => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return `0 ${symbol}`;

  switch (format) {
    case "compact":
      if (numAmount >= 1000) {
        const compact = formatLargeNumber(numAmount);
        return `${compact} ${symbol}`;
      }
      break;

    case "scientific":
      if (numAmount >= 1000 || numAmount < 0.001) {
        return `${numAmount.toExponential(2)} ${symbol}`;
      }
      break;
  }

  // For very large amounts in default mode, use compact notation
  if (format === "default" && numAmount >= 1e6) {
    const compact = formatLargeNumber(numAmount);
    return `${compact} ${symbol}`;
  }

  // Use different decimal places based on the amount
  let decimals = maxDecimals;
  if (numAmount >= 1) {
    decimals = Math.min(4, maxDecimals);
  } else if (numAmount >= 0.01) {
    decimals = Math.min(6, maxDecimals);
  }

  const formatted = numAmount.toFixed(decimals);
  // Remove trailing zeros
  const clean = parseFloat(formatted).toString();
  return `${clean} ${symbol}`;
};

/**
 * Format percentage with proper sign and decimal places
 */
export const formatPercentage = (
  percentage: number,
  decimals: number = 2,
  showSign: boolean = true,
): string => {
  const sign = showSign && percentage > 0 ? "+" : "";
  return `${sign}${percentage.toFixed(decimals)}%`;
};

/**
 * Format large numbers with K, M, B suffixes
 */
export const formatLargeNumber = (num: number): string => {
  const formatWithPrecision = (value: number, suffix: string): string => {
    // Use 2 decimal places for more precision, then remove trailing zeros
    const formatted = value.toFixed(2);
    const cleaned = parseFloat(formatted).toString();
    return cleaned + suffix;
  };

  if (num >= 1e12) {
    return formatWithPrecision(num / 1e12, "T");
  }
  if (num >= 1e9) {
    return formatWithPrecision(num / 1e9, "B");
  }
  if (num >= 1e6) {
    return formatWithPrecision(num / 1e6, "M");
  }
  if (num >= 1e3) {
    return formatWithPrecision(num / 1e3, "K");
  }
  return num.toLocaleString();
};

/**
 * Format number without currency symbol for changes and other numeric values
 */
export const formatNumber = (
  amount: number,
  locale: string = "en-CA",
  format: NumberFormat = "default",
): string => {
  switch (format) {
    case "compact":
      return new Intl.NumberFormat(locale, {
        notation: "compact",
        maximumFractionDigits: 3,
        minimumFractionDigits: 0,
      }).format(amount);

    case "scientific":
      return new Intl.NumberFormat(locale, {
        notation: "scientific",
        maximumFractionDigits: 3,
        minimumFractionDigits: 0,
      }).format(amount);

    default:
      // For very large amounts in default mode, use compact notation
      if (amount >= 1e6) {
        return new Intl.NumberFormat(locale, {
          notation: "compact",
          maximumFractionDigits: 2,
          minimumFractionDigits: 0,
        }).format(amount);
      }

      // For smaller amounts, use standard formatting
      return new Intl.NumberFormat(locale, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }).format(amount);
  }
};

/**
 * Format currency for compact display (more aggressive abbreviation)
 */
export const formatCompactCurrency = (
  amount: number,
  currency: string,
  locale: string = "en-CA",
): string => {
  // For amounts over 1K, always use compact notation
  if (amount >= 1000) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(amount);
  }

  // For smaller amounts, use standard formatting
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format crypto amount for compact display
 */
export const formatCompactCryptoAmount = (
  amount: number | string,
  symbol: string,
  maxDecimals: number = 4,
): string => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return `0 ${symbol}`;

  // For amounts over 1K, always use compact notation
  if (numAmount >= 1000) {
    const compact = formatLargeNumber(numAmount);
    return `${compact} ${symbol}`;
  }

  // Use fewer decimal places for display
  let decimals = Math.min(maxDecimals, 4);
  if (numAmount >= 1) {
    decimals = Math.min(2, maxDecimals);
  } else if (numAmount >= 0.01) {
    decimals = Math.min(4, maxDecimals);
  }

  const formatted = numAmount.toFixed(decimals);
  // Remove trailing zeros
  const clean = parseFloat(formatted).toString();
  return `${clean} ${symbol}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

/**
 * Truncate wallet address for display
 */
export const truncateAddress = (
  address: string,
  startChars: number = 6,
  endChars: number = 4,
): string => {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Generate unique ID
 */
export const generateId = (): number =>
  Date.now() + Math.floor(Math.random() * 1000);

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate cryptocurrency address (basic validation)
 */
export const isValidCryptoAddress = (
  address: string,
  type: string,
): boolean => {
  if (!address || typeof address !== "string") return false;

  switch (type.toLowerCase()) {
    case "btc":
    case "bitcoin":
      // Basic Bitcoin address validation (legacy, segwit, bech32)
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/.test(
        address,
      );

    case "eth":
    case "ethereum":
      // Basic Ethereum address validation
      return /^0x[a-fA-F0-9]{40}$/.test(address);

    case "kas":
    case "kaspa":
      // Basic Kaspa address validation
      return /^kaspa:[a-z0-9]{61}$/.test(address);

    case "sol":
    case "solana":
      // Basic Solana address validation (Base58 encoded, 32-44 characters)
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);

    default:
      // Generic validation - just check it's not empty and has reasonable length
      return address.length >= 20 && address.length <= 100;
  }
};

/**
 * Safe JSON parse with fallback
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

/**
 * Sleep utility for async operations
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Clamp number between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 */
export const isEmpty = (value: any): boolean => {
  if (value == null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
};

/**
 * Convert string to title case
 */
export const toTitleCase = (str: string): string => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
};
