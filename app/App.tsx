import React from 'react';
import { Platform, Text, View } from 'react-native';
import { WebLanding } from './screens/WebLanding';
import { Slot } from 'expo-router';

// Placeholder screen for mobile
const HomeScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Welcome to Espressyo Mobile!</Text>
  </View>
);

export default function App() {
  // For web, render the landing page
  if (Platform.OS === 'web') {
    return <WebLanding />;
  }

  // For mobile, use expo-router
  return <Slot />;
} 