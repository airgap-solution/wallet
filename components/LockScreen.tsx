import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { ThemedText } from './ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { BiometricAuthService } from '@/services/BiometricAuth';
import { theme } from '@/theme';

const { width, height } = Dimensions.get('window');

export default function LockScreen() {
  const { unlockApp, isAuthenticating } = useAuth();
  const [biometricType, setBiometricType] = useState<string>('Biometric Authentication');
  const [pulseAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Get biometric type description
    getBiometricType();

    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Start pulse animation
    startPulseAnimation();

    // Auto-trigger authentication after a brief delay
    const timer = setTimeout(() => {
      handleUnlock();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const getBiometricType = async () => {
    const type = await BiometricAuthService.getBiometricTypeDescription();
    setBiometricType(type);
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleUnlock = async () => {
    const success = await unlockApp();
    if (!success) {
      // Authentication failed or was cancelled
      // The user can try again by tapping the button
    }
  };

  const getBiometricIcon = () => {
    const type = biometricType.toLowerCase();
    if (type.includes('face')) {
      return 'face';
    } else if (type.includes('touch') || type.includes('fingerprint')) {
      return 'fingerprint';
    } else if (type.includes('iris')) {
      return 'visibility';
    }
    return 'security';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background gradient */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradient}
      />

      {/* Blur overlay */}
      <BlurView intensity={50} style={styles.blurOverlay} />

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* App Icon/Logo */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.logoGradient}
          >
            <MaterialIcons name="account-balance-wallet" size={48} color="white" />
          </LinearGradient>
        </View>

        {/* App Title */}
        <ThemedText style={styles.appTitle}>Modern Wallet</ThemedText>
        <ThemedText style={styles.subtitle}>Your crypto portfolio awaits</ThemedText>

        {/* Biometric Authentication Section */}
        <View style={styles.authSection}>
          <Animated.View style={[styles.biometricIconContainer, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              onPress={handleUnlock}
              disabled={isAuthenticating}
              style={[
                styles.biometricButton,
                isAuthenticating && styles.biometricButtonDisabled
              ]}
            >
              <MaterialIcons
                name={getBiometricIcon()}
                size={64}
                color={isAuthenticating ? 'rgba(255,255,255,0.5)' : 'white'}
              />
            </TouchableOpacity>
          </Animated.View>

          <ThemedText style={styles.authPrompt}>
            {isAuthenticating
              ? 'Authenticating...'
              : `Tap to unlock with ${biometricType}`
            }
          </ThemedText>
        </View>

        {/* Security Message */}
        <View style={styles.securityMessageContainer}>
          <MaterialIcons name="shield" size={20} color="rgba(255,255,255,0.7)" />
          <ThemedText style={styles.securityMessage}>
            Your wallet is protected with biometric authentication
          </ThemedText>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  logoContainer: {
    marginBottom: theme.spacing.xl,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: theme.spacing.xxxl,
    textAlign: 'center',
  },
  authSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  biometricIconContainer: {
    marginBottom: theme.spacing.xl,
  },
  biometricButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  biometricButtonDisabled: {
    opacity: 0.6,
  },
  authPrompt: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  securityMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  securityMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: theme.spacing.sm,
    textAlign: 'center',
    flex: 1,
  },
});
