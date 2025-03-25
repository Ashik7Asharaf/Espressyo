import { useEffect } from 'react';
import { LogBox } from 'react-native';
import { Slot } from 'expo-router';

export default function App() {
  useEffect(() => {
    // Ignore specific warnings
    LogBox.ignoreLogs([
      'Warning: Failed prop type',
      'Non-serializable values were found in the navigation state',
    ]);
  }, []);

  return <Slot />;
} 