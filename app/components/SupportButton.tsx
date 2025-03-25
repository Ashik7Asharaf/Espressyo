import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Alert } from 'react-native';
import { initializePaymentSheet } from '../services/stripe';
import { createRazorpayOrder } from '../services/razorpay';
import { supportTiers } from '../services/stripe';
import { razorpaySupportTiers } from '../services/razorpay';
import RazorpayPayment from './RazorpayCheckout';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

interface SupportButtonProps {
  creatorId: string;
  style?: any;
}

export default function SupportButton({ creatorId, style }: SupportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [razorpayOptions, setRazorpayOptions] = useState<any>(null);
  const router = useRouter();
  const isExpoGo = Constants.appOwnership === 'expo';

  const handleSupport = async () => {
    setLoading(true);
    try {
      // Always use Stripe in Expo Go, otherwise detect user's region
      const isIndianUser = !isExpoGo && true; // This should be dynamically determined in production

      if (isIndianUser) {
        // Handle Razorpay payment
        const order = await createRazorpayOrder(
          razorpaySupportTiers.basic.amount,
          creatorId
        );

        if (!order) {
          throw new Error('Failed to create Razorpay order');
        }

        const options = {
          key: order.key,
          amount: order.amount,
          currency: order.currency,
          name: 'Espressyo',
          description: 'Support your favorite creator',
          order_id: order.orderId,
          prefill: {
            // You can prefill user details here if available
            email: '',
            contact: '',
          },
          theme: {
            color: '#6366f1',
          },
        };

        setRazorpayOptions(options);
        setShowRazorpay(true);
      } else {
        // Handle Stripe payment
        const result = await initializePaymentSheet(
          supportTiers.basic.prices.usd.amount,
          'usd',
          creatorId
        );

        if (!result) {
          throw new Error('Failed to initialize payment');
        }

        const { clientSecret, ephemeralKey, customer, publishableKey } = result;

        // Initialize Stripe payment sheet
        router.push({
          pathname: '/payment',
          params: {
            clientSecret,
            ephemeralKey,
            customer,
            publishableKey,
            creatorId,
          },
        } as any);
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={handleSupport}
        disabled={loading}
      >
        <View style={styles.buttonContent}>
          <Text style={styles.buttonText}>
            {loading ? 'Processing...' : 'Support Creator'}
          </Text>
        </View>
      </TouchableOpacity>

      {showRazorpay && razorpayOptions && (
        <RazorpayPayment
          options={razorpayOptions}
          creatorId={creatorId}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 