import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { theme } from '@/theme';

export interface SettingsSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: any;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  subtitle,
  children,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {title && (
        <View style={styles.header}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {subtitle && (
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
          )}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = {
  container: {
    marginBottom: theme.spacing.xxxl,
  },
  header: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSizes.xl,
    fontWeight: theme.typography.fontWeights.bold,
    color: theme.colors.text.primary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSizes.sm,
    color: theme.colors.text.tertiary,
    lineHeight: 20,
  },
  content: {
    // Container for settings rows
  },
};

export default SettingsSection;
