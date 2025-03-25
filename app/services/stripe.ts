import { Alert } from 'react-native';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
const STRIPE_PUBLISHABLE_KEY = Constants.expoConfig?.extra?.stripePublishableKey;

// Creator account management
export async function createCreatorAccount(country: string = 'US') {
  try {
    const response = await fetch(`${API_URL}/create-connected-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ country }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.accountId;
  } catch (error) {
    console.error('Error creating creator account:', error);
    Alert.alert('Error', 'Failed to create creator account');
    return null;
  }
}

// Get creator's balance
export async function getCreatorBalance(creatorId: string) {
  try {
    const response = await fetch(`${API_URL}/creator-balance/${creatorId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error getting creator balance:', error);
    Alert.alert('Error', 'Failed to get balance');
    return null;
  }
}

// Request payout
export async function requestPayout(creatorId: string, amount: number, currency: string) {
  try {
    const response = await fetch(`${API_URL}/create-payout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creatorId,
        amount,
        currency,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  } catch (error) {
    console.error('Error requesting payout:', error);
    Alert.alert('Error', 'Failed to request payout');
    return null;
  }
}

// Initialize payment sheet for one-time support
export async function initializePaymentSheet(
  amount: number,
  currency: string = 'usd',
  creatorId: string
) {
  try {
    const response = await fetch(`${API_URL}/create-payment-intent`, {
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

    return {
      clientSecret: data.clientSecret,
      ephemeralKey: data.ephemeralKey,
      customer: data.customer,
      publishableKey: STRIPE_PUBLISHABLE_KEY,
    };
  } catch (error) {
    console.error('Error initializing payment:', error);
    Alert.alert('Error', 'Payment initialization failed');
    return null;
  }
}

// Create subscription
export async function createSubscription(
  priceId: string,
  currency: string = 'usd',
  creatorId: string
) {
  try {
    const response = await fetch(`${API_URL}/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        currency,
        creatorId,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error);

    return {
      clientSecret: data.clientSecret,
      subscriptionId: data.subscriptionId,
    };
  } catch (error) {
    console.error('Error creating subscription:', error);
    Alert.alert('Error', 'Failed to create subscription');
    return null;
  }
}

// Support tiers with prices for different currencies
export const supportTiers = {
  basic: {
    name: 'Basic Support',
    prices: {
      usd: { amount: 5, priceId: 'price_basic_usd' },
      eur: { amount: 5, priceId: 'price_basic_eur' },
      gbp: { amount: 4, priceId: 'price_basic_gbp' },
      inr: { amount: 400, priceId: 'price_basic_inr' },
      aud: { amount: 7, priceId: 'price_basic_aud' },
      sgd: { amount: 7, priceId: 'price_basic_sgd' },
      myr: { amount: 20, priceId: 'price_basic_myr' },
      jpy: { amount: 500, priceId: 'price_basic_jpy' },
    },
  },
  premium: {
    name: 'Premium Support',
    prices: {
      usd: { amount: 20, priceId: 'price_premium_usd' },
      eur: { amount: 20, priceId: 'price_premium_eur' },
      gbp: { amount: 16, priceId: 'price_premium_gbp' },
      inr: { amount: 1600, priceId: 'price_premium_inr' },
      aud: { amount: 28, priceId: 'price_premium_aud' },
      sgd: { amount: 28, priceId: 'price_premium_sgd' },
      myr: { amount: 80, priceId: 'price_premium_myr' },
      jpy: { amount: 2000, priceId: 'price_premium_jpy' },
    },
  },
}; 