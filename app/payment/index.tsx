import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import { initStripe, presentPaymentSheet } from '@stripe/stripe-react-native';
import { verifyRazorpayPayment } from '../services/razorpay';

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.type === 'stripe') {
      handleStripePayment();
    }
  }, []);

  const handleStripePayment = async () => {
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
        router.replace({
          pathname: '/payment/success',
          params: { creatorId: params.creatorId },
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      router.back();
    }
  };

  const handleRazorpayResponse = async (response: any) => {
    try {
      const result = await verifyRazorpayPayment({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      });

      if (result?.status === 'success') {
        router.replace({
          pathname: '/payment/success',
          params: { creatorId: params.creatorId },
        });
      } else {
        router.back();
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      router.back();
    }
  };

  if (params.type === 'razorpay') {
    const options = JSON.parse(params.options as string);
    const razorpayScript = `
      const options = ${JSON.stringify(options)};
      const rzp = new Razorpay(options);
      rzp.on('payment.success', function(response) {
        window.ReactNativeWebView.postMessage(JSON.stringify(response));
      });
      rzp.on('payment.error', function(response) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ error: response }));
      });
      rzp.open();
    `;

    return (
      <WebView
        source={{
          html: `
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
              </head>
              <body>
                <script>${razorpayScript}</script>
              </body>
            </html>
          `,
        }}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.error) {
            router.back();
          } else {
            handleRazorpayResponse(data);
          }
        }}
        onLoadEnd={() => setLoading(false)}
        style={styles.webview}
      />
    );
  }

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
  webview: {
    flex: 1,
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