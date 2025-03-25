import React from 'react';
import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

interface RazorpayProps {
  options: {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: {
      color?: string;
    };
  };
  creatorId: string;
}

export default function RazorpayPayment({ options, creatorId }: RazorpayProps) {
  const router = useRouter();
  const isExpoGo = Constants.appOwnership === 'expo';

  React.useEffect(() => {
    if (isExpoGo) {
      Alert.alert(
        'Development Mode',
        'Razorpay payments are not available in Expo Go. Please use Stripe for testing or create a development build.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
      return;
    }

    const initializeRazorpay = async () => {
      try {
        // Only import Razorpay when not in Expo Go
        const RazorpayCheckout = require('react-native-razorpay').default;
        const data = await RazorpayCheckout.open(options);
        
        // Verify the payment
        const { verifyRazorpayPayment } = await import('../services/razorpay');
        const result = await verifyRazorpayPayment({
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_order_id: data.razorpay_order_id,
          razorpay_signature: data.razorpay_signature,
        });

        if (result?.status === 'success') {
          router.replace(`/creator/${creatorId}`);
          Alert.alert('Success', 'Payment successful! Thank you for your support.');
        } else {
          Alert.alert('Error', 'Payment verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Payment error:', error);
        Alert.alert(
          'Error',
          'Payment failed. Please try again or choose a different payment method.'
        );
      }
    };

    initializeRazorpay();
  }, []);

  // This component doesn't render anything visible
  return null;
} 