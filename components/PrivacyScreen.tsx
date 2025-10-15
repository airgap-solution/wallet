import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface PrivacyScreenProps {
  isVisible: boolean;
}

export default function PrivacyScreen({ isVisible }: PrivacyScreenProps) {
  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      {/* Background blur */}
      <BlurView intensity={100} style={styles.blurView} />

      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />

      {/* Privacy content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="visibility-off" size={64} color="#ffffff" />
        </View>

        <Text style={styles.title}>Privacy Mode</Text>
        <Text style={styles.subtitle}>
          Your wallet information is hidden for privacy
        </Text>

        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>Crypto Wallet</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width,
    height,
    zIndex: 9999,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
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
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 48,
  },
  brandContainer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
});
