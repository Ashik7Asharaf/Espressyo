import express from 'express';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import cors from 'cors';
import crypto from 'crypto';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Stripe with the correct API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Initialize Razorpay with proper error handling
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// Platform commission rate (5%)
const PLATFORM_COMMISSION_RATE = 0.05;

app.use(cors());

// Create a connected account for creators
app.post('/create-connected-account', async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country: req.body.country || 'US',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
    });

    res.json({ accountId: account.id });
  } catch (error) {
    console.error('Error creating connected account:', error);
    res.status(500).json({ error: 'Failed to create connected account' });
  }
});

// Create a payment intent for one-time support
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', creatorId } = req.body;

    // Calculate platform fee (5%)
    const platformFee = Math.round(amount * PLATFORM_COMMISSION_RATE);
    const creatorAmount = amount - platformFee;

    // Create a customer
    const customer = await stripe.customers.create();

    // Create an ephemeral key for the customer
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2025-02-24.acacia' as const }
    );

    // Create a payment intent with automatic transfer to creator
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customer.id,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      application_fee_amount: platformFee,
      transfer_data: {
        destination: creatorId,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Create a subscription
app.post('/create-subscription', async (req, res) => {
  try {
    const { priceId, currency = 'usd', creatorId } = req.body;

    // Create a customer
    const customer = await stripe.customers.create();

    // Create a subscription with automatic transfer to creator
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      application_fee_percent: PLATFORM_COMMISSION_RATE * 100,
      transfer_data: {
        destination: creatorId,
      },
      expand: ['latest_invoice.payment_intent'],
    });

    // @ts-ignore - Stripe types are not perfect
    const clientSecret = subscription.latest_invoice.payment_intent.client_secret;

    res.json({
      clientSecret,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Get supported payment methods for each currency
function getPaymentMethodsForCurrency(currency: string): string[] {
  const paymentMethods: Record<string, string[]> = {
    usd: ['card'],
    eur: ['card', 'sepa_debit'],
    gbp: ['card', 'bacs_debit'],
    inr: ['card', 'upi'],
    aud: ['card', 'au_becs_debit'],
    sgd: ['card', 'grabpay', 'paynow'],
    myr: ['card', 'grabpay', 'fpx'],
    jpy: ['card', 'konbini'],
  };

  return paymentMethods[currency] || ['card'];
}

// Get creator's balance
app.get('/creator-balance/:creatorId', async (req, res) => {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: req.params.creatorId,
    });

    res.json(balance);
  } catch (error) {
    console.error('Error retrieving balance:', error);
    res.status(500).json({ error: 'Failed to retrieve balance' });
  }
});

// Create a payout for creator
app.post('/create-payout', async (req, res) => {
  try {
    const { amount, currency, creatorId } = req.body;

    const payout = await stripe.payouts.create({
      amount,
      currency,
      method: 'standard',
    }, {
      stripeAccount: creatorId,
    });

    res.json(payout);
  } catch (error) {
    console.error('Error creating payout:', error);
    res.status(500).json({ error: 'Failed to create payout' });
  }
});

// Create a Razorpay order for Indian payments
app.post('/create-razorpay-order', async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ error: 'Razorpay integration is not configured' });
    }

    const { amount, currency = 'INR', creatorId } = req.body;

    // Calculate platform fee (5%)
    const platformFee = Math.round(amount * PLATFORM_COMMISSION_RATE);
    const creatorAmount = amount - platformFee;

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      notes: {
        creatorId: creatorId.toString(),
        platformFee: platformFee.toString(),
        creatorAmount: creatorAmount.toString(),
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify Razorpay payment
app.post('/verify-razorpay-payment', async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ error: 'Razorpay integration is not configured' });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(sign)
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment is verified, now transfer to creator
      const payment = await razorpay.payments.fetch(razorpay_payment_id);
      const order = await razorpay.orders.fetch(razorpay_order_id);
      
      // Type assertion for notes
      const notes = order.notes as { creatorId: string; platformFee: string; creatorAmount: string };
      const { creatorId, platformFee, creatorAmount } = notes;

      res.json({
        status: 'success',
        message: 'Payment verified successfully',
        payment: {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          creatorAmount: parseInt(creatorAmount),
          platformFee: parseInt(platformFee),
        },
      });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Create a Razorpay subscription
app.post('/create-razorpay-subscription', async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ error: 'Razorpay integration is not configured' });
    }

    const { planId, creatorId } = req.body;

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      total_count: 12, // 12 months subscription
      notes: {
        creatorId: creatorId.toString(),
        platformFee: (PLATFORM_COMMISSION_RATE * 100).toString(), // Store as percentage
      },
    });

    res.json({
      subscriptionId: subscription.id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// DeepSeek API test endpoint
app.get('/test-deepseek', async (req, res) => {
  try {
    const testUserId = 'test-user-123';
    
    // Test personalized feed
    const feedResponse = await fetch(
      `${process.env.EXPO_PUBLIC_DEEPSEEK_API_URL}/feed/personalized?userId=${testUserId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY}`,
        },
      }
    );

    if (!feedResponse.ok) {
      throw new Error(`Feed API error: ${feedResponse.statusText}`);
    }

    const feedData = await feedResponse.json();

    // Test creator recommendations
    const creatorsResponse = await fetch(
      `${process.env.EXPO_PUBLIC_DEEPSEEK_API_URL}/creators/recommendations?userId=${testUserId}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY}`,
        },
      }
    );

    if (!creatorsResponse.ok) {
      throw new Error(`Creators API error: ${creatorsResponse.statusText}`);
    }

    const creatorsData = await creatorsResponse.json();

    res.json({
      status: 'success',
      message: 'DeepSeek API test successful',
      feed: {
        status: feedResponse.status,
        data: feedData,
      },
      creators: {
        status: creatorsResponse.status,
        data: creatorsData,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('DeepSeek API test failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'DeepSeek API test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 