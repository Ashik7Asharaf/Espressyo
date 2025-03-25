import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { initStripe, presentPaymentSheet } from '@stripe/stripe-react-native';

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    handlePayment();
  }, []);

  const handlePayment = async () => {
    try {
      await initStripe({
        publishableKey: params.publishableKey as string,
      });

      const { error } = await presentPaymentSheet({
        clientSecret: params.clientSecret as string,
      });

      if (error) {
        console.error('Payment failed:', error);
        router.back();
      } else {
        // Payment successful
        router.replace(`/creator/${params.creatorId}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Processing payment...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4b5563',
  },
}); 