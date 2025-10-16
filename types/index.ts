// Centralized type definitions for the wallet app

/**
 * Wallet and Account Types
 */
export interface WalletInfo {
  DerivationPath: string;
  ChainCode: string | Uint8Array;
  Name: string;
  Internal1: boolean | string;
  Internal2: boolean | string;
  SomeBytes: string | Uint8Array;
  XPub: string;
}

export interface Account {
  ID: number;
  Index: number;
  Type: string;
  Block: number;
  Wallet: WalletInfo;
}

export interface CoinMetadata {
  name: string;
  symbol: string;
  image: any;
  color: string;
}

export interface MappedAccount {
  id: string;
  name: string;
  symbol: string;
  image: any;
  color: string;
  fiatAmount: number | null;
  coinAmount: number | string | null;
  fiatCurrency: string;
  change24h: number | null;
  raw: Account;
}

/**
 * API Response Types
 */
export interface BalanceApiResponse {
  fiat_value: number;
  crypto_balance: number;
  fiat_symbol: string;
  change24h: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * Context Types
 */
export interface AccountsContextType {
  accounts: Account[];
  addOrUpdateAccount: (account: Account) => Promise<void>;
  deleteAccount: (xpub: string) => Promise<void>;
  clearAccounts: () => Promise<void>;
  reloadAccounts: () => Promise<void>;
}

export interface FiatContextType {
  fiat: string;
  setFiat: (currency: string) => void;
  supportedCurrencies: string[];
}

/**
 * Component Props Types
 */
export interface CoinCardProps {
  coin: MappedAccount;
  onPress: () => void;
  onDelete: (xpub: string) => void;
}

export interface TotalBalanceProps {
  total: number;
  changePercent: number;
  fiat: string;
  isLoading?: boolean;
}

export interface TransactionModalProps {
  visible: boolean;
  onClose: () => void;
  coin: MappedAccount | null;
}

export interface SkeletonLineProps {
  width: number | string;
  height: number;
  style?: any;
  borderRadius?: number;
}

export interface ThemedTextProps {
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
  style?: any;
  children: React.ReactNode;
}

export interface ThemedViewProps {
  style?: any;
  children: React.ReactNode;
}

/**
 * Navigation Types
 */
export interface TabParamList {
  index: undefined;
  explore: undefined;
  profile: undefined;
}

export interface RootStackParamList {
  "(tabs)": undefined;
  "+not-found": undefined;
  modal: undefined;
}

/**
 * Form Types
 */
export interface AddAccountForm {
  type: string;
  xpub: string;
}

export interface SettingsForm {
  currency: string;
  notifications: boolean;
  biometric: boolean;
}

/**
 * Animation Types
 */
export interface AnimationConfig {
  duration?: number;
  easing?: any;
  delay?: number;
  useNativeDriver?: boolean;
}

export interface PressAnimationHook {
  animatedValue: any;
  animateIn: () => void;
  animateOut: () => void;
}

export interface SlideAnimationHook {
  animatedValue: any;
  slideTo: (value: number) => void;
  resetSlide: () => void;
}

/**
 * Theme Types
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
  };
  success: string;
  error: string;
  warning: string;
  info: string;
  crypto: {
    btc: string;
    eth: string;
    kas: string;
    sol: string;
  };
  border: string;
  overlay: string;
  gradients: {
    primary: string[];
    secondary: string[];
    card: string[];
  };
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  huge: number;
}

export interface ThemeTypography {
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
    huge: number;
    massive: number;
  };
  fontWeights: {
    light: string;
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
    extrabold: string;
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: number;
    normal: number;
    wide: number;
    wider: number;
    widest: number;
  };
}

/**
 * Utility Types
 */
export type CryptoType = "btc" | "eth" | "kas" | "sol";
export type FiatCurrency = "CAD" | "USD" | "EUR" | "GBP";
export type LoadingState = "idle" | "loading" | "success" | "error";
export type Theme = "light" | "dark";

/**
 * Error Types
 */
export interface AppError {
  message: string;
  code?: string;
  stack?: string;
  context?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

/**
 * Storage Types
 */
export interface StorageKeys {
  ACCOUNTS: "accountsData";
  FIAT_CURRENCY: "fiatCurrency";
  SETTINGS: "appSettings";
  THEME: "appTheme";
}

export interface AppSettings {
  notifications: boolean;
  biometric: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  theme: Theme;
}

/**
 * Constants Types
 */
export interface CoinMetaMap {
  [key: string]: CoinMetadata;
}

export interface SupportedCurrencies {
  [key: string]: {
    symbol: string;
    name: string;
    locale: string;
  };
}
