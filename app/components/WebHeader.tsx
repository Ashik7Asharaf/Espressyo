import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { ResponsiveLayout } from './ResponsiveLayout';

interface WebHeaderProps {
  onLoginPress?: () => void;
  onSignupPress?: () => void;
}

export const WebHeader: React.FC<WebHeaderProps> = ({
  onLoginPress,
  onSignupPress,
}) => {
  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.headerContainer}>
      <ResponsiveLayout>
        <View style={styles.header}>
          <Text style={styles.logo}>Esspress Yo</Text>
          <View style={styles.nav}>
            <Pressable onPress={onLoginPress} style={styles.navButton}>
              <Text style={styles.navButtonText}>Login</Text>
            </Pressable>
            <Pressable onPress={onSignupPress} style={[styles.navButton, styles.signupButton]}>
              <Text style={styles.signupButtonText}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </ResponsiveLayout>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 80,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  nav: {
    flexDirection: 'row',
    gap: 16,
  },
  navButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  signupButton: {
    backgroundColor: '#007AFF',
  },
  signupButtonText: {
    color: '#ffffff',
  },
}); 