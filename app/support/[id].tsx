import { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Text } from '../../components/Themed';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { initializePaymentSheet, createSubscription, supportTiers } from '../services/stripe';
import { useStripe } from '@stripe/stripe-react-native';

// Currency options
const currencies = [
  { code: 'usd', symbol: '$', name: 'USD' },
  { code: 'inr', symbol: '₹', name: 'INR' },
];

// Support options with multi-currency
const supportOptions = [
  {
    id: 'one-time',
    title: 'One-time Support',
    description: 'Send a one-time tip to support the creator',
    icon: 'heart',
    color: '#FF6B6B',
  },
  {
    id: 'monthly',
    title: 'Monthly Support',
    description: 'Subscribe monthly to support the creator',
    icon: 'star',
    color: '#FFD93D',
  },
];

// Monthly tiers with multi-currency support
const getMonthlyTiers = (currency: string) => [
  {
    id: 'basic',
    title: 'Basic Support',
    price: currency === 'inr' ? 399 : 5,
    currency,
    description: 'Access to exclusive posts and community',
    features: ['Exclusive posts', 'Community access', 'Creator updates'],
  },
  {
    id: 'premium',
    title: 'Premium Support',
    price: currency === 'inr' ? 799 : 10,
    currency,
    description: 'All basic benefits + direct creator interaction',
    features: ['All basic benefits', 'Direct creator interaction', 'Priority support'],
  },
];

export default function SupportScreen() {
  const { id } = useLocalSearchParams();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState('usd');
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const monthlyTiers = getMonthlyTiers(selectedCurrency);

  const getCurrencySymbol = (code: string) => {
    const currency = currencies.find(c => c.code === code);
    return currency ? currency.symbol : '$';
  };

  async function handleOneTimePayment(amount: number) {
    try {
      setLoading(true);
      const paymentIntent = await initializePaymentSheet(amount);
      
      if (!paymentIntent) {
        throw new Error('Failed to create payment intent');
      }

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: paymentIntent.clientSecret,
        customerEphemeralKeySecret: paymentIntent.ephemeralKey,
        customerId: paymentIntent.customer,
        merchantDisplayName: 'Espressyo',
      });

      if (error) {
        throw error;
      }

      const { error: presentError } = await presentPaymentSheet();
      
      if (presentError) {
        throw presentError;
      }

      Alert.alert('Success', 'Thank you for your support!');
      router.back();
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscription(tierId: string) {
    try {
      setLoading(true);
      const clientSecret = await createSubscription(tierId);
      
      if (!clientSecret) {
        throw new Error('Failed to create subscription');
      }

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Espressyo',
      });

      if (error) {
        throw error;
      }

      const { error: presentError } = await presentPaymentSheet();
      
      if (presentError) {
        throw presentError;
      }

      Alert.alert('Success', 'Thank you for subscribing!');
      router.back();
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert('Error', 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment() {
    try {
      setLoading(true);
      if (selectedOption === 'one-time') {
        const amount = 500; // $5 or ₹399
        await handleOneTimePayment(amount);
      } else if (selectedOption === 'monthly' && selectedTier) {
        const tier = monthlyTiers.find(t => t.id === selectedTier);
        if (tier) {
          await handleSubscription(tier.id);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Support Creator</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Currency</Text>
        <View style={styles.currencyOptions}>
          {currencies.map((currency) => (
            <TouchableOpacity
              key={currency.code}
              style={[
                styles.currencyOption,
                selectedCurrency === currency.code && styles.selectedCurrency,
              ]}
              onPress={() => setSelectedCurrency(currency.code)}>
              <Text style={styles.currencyText}>
                {currency.symbol} {currency.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Support Type</Text>
        {supportOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              selectedOption === option.id && styles.selectedOption,
            ]}
            onPress={() => setSelectedOption(option.id)}>
            <Ionicons name={option.icon as any} size={24} color={option.color} />
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {selectedOption === 'monthly' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Support Tier</Text>
          {monthlyTiers.map((tier) => (
            <TouchableOpacity
              key={tier.id}
              style={[
                styles.tierCard,
                selectedTier === tier.id && styles.selectedTier,
              ]}
              onPress={() => setSelectedTier(tier.id)}>
              <View style={styles.tierHeader}>
                <Text style={styles.tierTitle}>{tier.title}</Text>
                <Text style={styles.tierPrice}>
                  {getCurrencySymbol(selectedCurrency)}{tier.price}/month
                </Text>
              </View>
              <Text style={styles.tierDescription}>{tier.description}</Text>
              <View style={styles.featuresList}>
                {tier.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.payButton,
          (loading || !selectedOption || (selectedOption === 'monthly' && !selectedTier)) &&
          styles.disabledButton,
        ]}
        onPress={handlePayment}
        disabled={loading || !selectedOption || (selectedOption === 'monthly' && !selectedTier)}>
        <Text style={styles.payButtonText}>
          {loading ? 'Processing...' :
            selectedOption === 'one-time'
              ? 'Continue to Payment'
              : selectedTier
                ? 'Continue to Payment'
                : 'Select a Tier'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  currencyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  currencyOption: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 100,
    alignItems: 'center',
  },
  selectedCurrency: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 1,
  },
  optionInfo: {
    marginLeft: 15,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  tierCard: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedTier: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 1,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  tierPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  tierDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  featuresList: {
    marginTop: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 14,
  },
  payButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 