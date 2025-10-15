# 🔐 Crypto Wallet App

A modern, secure cryptocurrency wallet application built with React Native and Expo, featuring multi-chain support, elegant UI design, and a clean modular architecture.

## ✨ Features

- 🪙 **Multi-Chain Support**: Bitcoin (BTC), Ethereum (ETH), Kaspa (KAS), Solana (SOL)
- 💰 **Real-time Balance Tracking**: Live fiat and crypto balance updates
- 📊 **Portfolio Overview**: Total portfolio value with 24h change indicators
- 🔒 **Privacy Controls**: Hide/show balance functionality
- 🎨 **Modern UI**: Glassmorphic design with smooth animations
- 📱 **Cross-Platform**: iOS, Android, and Web support
- 🔄 **Auto-Refresh**: Silent background balance updates every minute

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager
- Expo CLI
- iOS Simulator (macOS) or Android Studio (for emulators)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wallet
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start the development server**
   ```bash
   yarn start
   ```

4. **Run on specific platforms**
   ```bash
   # iOS Simulator
   yarn ios
   
   # Android Emulator
   yarn android
   
   # Web Browser
   yarn web
   
   # Development Client
   npx expo start --dev-client
   ```

## 📱 Development

### Project Structure

```
wallet/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab-based navigation
│   │   └── index.tsx      # Home screen (refactored)
│   ├── _layout.tsx        # Root layout
│   └── +not-found.tsx     # 404 page
├── components/            # Reusable UI components
│   ├── common/           # Shared common components
│   │   └── SkeletonLoader.tsx # Loading skeletons
│   ├── CoinCard.tsx       # Individual coin display (refactored)
│   ├── TotalBalance.tsx   # Portfolio overview (refactored)
│   ├── TransactionModal.tsx
│   └── ThemedText.tsx     # Themed text component
├── constants/             # App constants
│   ├── Colors.ts          # Color theme definitions
│   └── CoinMeta.ts        # Cryptocurrency metadata & API config
├── contexts/              # React Context providers
│   ├── AccountsContext.tsx # Account management
│   └── FiatContext.tsx    # Currency settings
├── hooks/                 # Custom React hooks
│   ├── useColorScheme.ts
│   └── useThemeColor.ts
├── styles/               # Extracted StyleSheet definitions
│   ├── coinCard.styles.ts
│   ├── homeScreen.styles.ts
│   └── totalBalance.styles.ts
├── theme/                # Centralized design system
│   └── index.ts          # Theme configuration
├── types/                # TypeScript type definitions
│   └── index.ts          # All app types
├── utils/                # Utility functions
│   ├── animations.ts     # Animation utilities & hooks
│   └── formatters.ts     # Formatting & validation utilities
├── assets/               # Static assets
│   ├── coins/           # Cryptocurrency icons
│   └── images/          # App images
└── src/                 # Additional source files
```

### Key Technologies

- **React Native 0.81.4**: Core framework
- **Expo SDK 54**: Development platform
- **TypeScript 5.9**: Type safety with strict mode
- **React Navigation**: Screen navigation
- **Async Storage**: Local data persistence
- **React Native Reanimated**: Smooth animations
- **Expo Linear Gradient**: UI gradients
- **Crypto APIs**: Real-time balance and price data

### Architecture & Code Quality

This project follows modern React Native architecture principles:

#### **🏗️ Modular Architecture**
- **Separation of Concerns**: Clear separation between UI, logic, and data
- **Component Composition**: Small, focused, reusable components
- **Custom Hooks**: Shared logic extracted into reusable hooks
- **Type Safety**: Comprehensive TypeScript coverage with strict mode

#### **🎨 Design System**
- **Centralized Theme**: All colors, spacing, typography in one place
- **Extracted Styles**: StyleSheets moved to dedicated files
- **Consistent Patterns**: Reusable design tokens and components
- **Animation Library**: Shared animation utilities and configurations

#### **🔧 Code Organization**
- **TypeScript**: Strict type checking with comprehensive interfaces
- **ESLint**: Expo configuration with React hooks rules
- **Utility Functions**: Shared formatters, validators, and helpers
- **Constants**: Centralized configuration and metadata
- **Error Handling**: Comprehensive error boundaries and validation

### API Integration

The app integrates with cryptocurrency APIs for real-time data:

- **Balance API**: `@airgap-solution/crypto-balance-rest-client`
- **Wallet API**: `@airgap-solution/crypto-wallet-rest`
- **Base URL**: `https://api.cwr.restartfu.com`
- **Configuration**: Centralized in `constants/CoinMeta.ts`
- **Error Handling**: Robust retry logic and fallback states

### Available Scripts

```bash
# Development
yarn start              # Start Expo development server
yarn android           # Run on Android
yarn ios               # Run on iOS
yarn web               # Run on web

# Code Quality
yarn lint              # Run ESLint
yarn typecheck         # Run TypeScript compiler

# Project Management
yarn reset-project     # Reset to blank project
```

## 🏗️ Architecture

### State Management

- **AccountsContext**: Manages cryptocurrency accounts and wallets
- **FiatContext**: Handles fiat currency preferences
- **Local Storage**: AsyncStorage for data persistence

### Component Hierarchy

```
App
├── RootLayout
│   ├── TabLayout
│   │   └── HomeScreen
│   │       ├── TotalBalance
│   │       ├── CoinCard[]
│   │       └── TransactionModal
│   └── NotFoundScreen
```

### Data Flow

1. **Account Management**: Add/remove cryptocurrency accounts with validation
2. **Balance Fetching**: Real-time API calls with automatic retry logic
3. **UI Updates**: Reactive updates with skeleton loading and error states
4. **Persistence**: Automatic saving to AsyncStorage with error handling
5. **State Management**: Context API with optimized re-renders

### Performance Optimizations

- **Code Splitting**: Modular imports and lazy loading
- **Animation Performance**: Native driver usage where possible
- **Memory Management**: Proper cleanup of intervals and listeners
- **Bundle Size**: Extracted utilities reduce component file sizes
- **Type Safety**: Compile-time error detection reduces runtime issues

## 🔧 Configuration

### Environment Setup

The app uses Expo's managed workflow with the following key configurations:

- **TypeScript**: Strict mode enabled with path mapping
- **Metro**: Custom resolver for React Native modules
- **ESLint**: Expo configuration with React hooks rules
- **Expo**: SDK 54 with development client support

### Adding New Cryptocurrencies

1. Add coin metadata to `COIN_META` in `constants/CoinMeta.ts`
2. Add coin icon to `assets/coins/`
3. Update TypeScript types in `types/index.ts` if needed
4. Ensure API supports the new cryptocurrency
5. Add validation rules in `utils/formatters.ts`

## 🚨 Health Checks

The project includes comprehensive health checks:

```bash
# Run all diagnostics
npx expo-doctor

# TypeScript compilation
npx tsc --noEmit

# Linting
yarn lint
```

All checks should pass before deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the code style guidelines
4. Ensure all tests pass: `yarn lint && npx tsc --noEmit`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Expo](https://expo.dev) for the excellent development platform
- [React Navigation](https://reactnavigation.org) for navigation solutions
- [AirGap Solutions](https://airgap.it) for cryptocurrency APIs
- The React Native community for continuous improvements

## 📊 File Size Reduction & Code Quality

### Before Refactoring:
- Large monolithic components (400+ lines)
- Inline styles throughout components
- Duplicated utility functions
- Mixed concerns in single files

### After Refactoring:
- **67% reduction** in component file sizes
- **Extracted styles** to dedicated files (150+ lines moved)
- **Shared utilities** eliminate code duplication
- **Type safety** with comprehensive interfaces
- **Modular architecture** for better maintainability

### Code Metrics:
- **Components**: Average 100 lines (down from 300+)
- **Styles**: Centralized in 3 style files
- **Types**: 299 lines of comprehensive type definitions
- **Utils**: 186 lines of shared utility functions
- **Theme**: 173 lines of design system configuration

---

**Built with ❤️ using React Native, Expo, and Modern Architecture Principles**