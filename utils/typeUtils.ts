// Type conversion utilities for handling API responses and data validation

/**
 * Safely converts a value to boolean, handling string representations
 */
export const safeBoolean = (value: boolean | string | unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const lowercased = value.toLowerCase().trim();
    return lowercased === 'true' || lowercased === '1' || lowercased === 'yes';
  }

  // Handle numbers
  if (typeof value === 'number') {
    return value !== 0;
  }

  // Default to false for null, undefined, or other types
  return false;
};

/**
 * Safely converts a value to number, handling string representations
 */
export const safeNumber = (value: number | string | unknown, defaultValue = 0): number => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  return defaultValue;
};

/**
 * Safely converts a value to string
 */
export const safeString = (value: string | unknown, defaultValue = ''): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (value === null || value === undefined) {
    return defaultValue;
  }

  return String(value);
};

/**
 * Validates and sanitizes WalletInfo data
 */
export const sanitizeWalletInfo = (walletInfo: any): any => {
  return {
    ...walletInfo,
    Internal1: safeBoolean(walletInfo.Internal1),
    Internal2: safeBoolean(walletInfo.Internal2),
    DerivationPath: safeString(walletInfo.DerivationPath),
    Name: safeString(walletInfo.Name),
    XPub: safeString(walletInfo.XPub),
  };
};

/**
 * Validates and sanitizes Account data
 */
export const sanitizeAccount = (account: any): any => {
  return {
    ...account,
    ID: safeNumber(account.ID),
    Index: safeNumber(account.Index),
    Type: safeString(account.Type),
    Block: safeNumber(account.Block),
    Wallet: sanitizeWalletInfo(account.Wallet),
  };
};

/**
 * Validates and sanitizes API balance response data
 */
export const sanitizeBalanceResponse = (response: any): any => {
  return {
    ...response,
    crypto_balance: safeNumber(response.crypto_balance),
    fiat_value: safeNumber(response.fiat_value),
    exchange_rate: safeNumber(response.exchange_rate),
    change24h: safeNumber(response.change24h),
    crypto_symbol: safeString(response.crypto_symbol),
    address: safeString(response.address),
    fiat_symbol: safeString(response.fiat_symbol),
    timestamp: safeString(response.timestamp),
    error: response.error ? safeString(response.error) : undefined,
  };
};

/**
 * Type guard to check if a value is a valid number
 */
export const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

/**
 * Type guard to check if a value is a non-empty string
 */
export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Safely parse JSON with error handling
 */
export const safeJsonParse = (jsonString: string, defaultValue: any = null): any => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Failed to parse JSON:', error);
    return defaultValue;
  }
};

/**
 * Deep clone object with type safety
 */
export const safeClone = <T>(obj: T): T => {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.warn('Failed to clone object:', error);
    return obj;
  }
};
