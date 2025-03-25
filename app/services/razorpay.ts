import { Alert } from 'react-native';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
const RAZORPAY_KEY_ID = Constants.expoConfig?.extra?.razorpayKeyId;

interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpaySubscription {
  subscriptionId: string;
  key: string;
}

// Initialize Razorpay order for one-time support
export async function createRazorpayOrder(
  amount: number,
  creatorId: string,
  currency: string = 'INR'
): Promise<RazorpayOrder | null> {
  try {
    const response = await fetch(`${API_URL}/create-razorpay-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        creatorId,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    Alert.alert('Error', 'Failed to create payment order');
    return null;
  }
}

// Verify Razorpay payment
export async function verifyRazorpayPayment(
  paymentResponse: RazorpayPaymentResponse
) {
  try {
    const response = await fetch(`${API_URL}/verify-razorpay-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentResponse),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    Alert.alert('Error', 'Failed to verify payment');
    return null;
  }
}

// Create Razorpay subscription
export async function createRazorpaySubscription(
  planId: string,
  creatorId: string
): Promise<RazorpaySubscription | null> {
  try {
    const response = await fetch(`${API_URL}/create-razorpay-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        creatorId,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    Alert.alert('Error', 'Failed to create subscription');
    return null;
  }
}

// Support tiers with Razorpay plan IDs
export const razorpaySupportTiers = {
  basic: {
    name: 'Basic Support',
    amount: 400, // INR
    planId: 'plan_basic_inr',
  },
  premium: {
    name: 'Premium Support',
    amount: 1600, // INR
    planId: 'plan_premium_inr',
  },
}; 