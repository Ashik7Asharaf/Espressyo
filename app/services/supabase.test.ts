import { supabase } from '../lib/supabase';

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('test').select('*').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error.message);
      return false;
    }
    
    console.log('Supabase connection successful:', data);
    return true;
  } catch (error) {
    console.error('Supabase test error:', error);
    return false;
  }
}

// Test payment-related tables
export async function testPaymentTables() {
  try {
    // Test transactions table
    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .limit(1);
    
    if (transactionError) {
      console.error('Error accessing transactions:', transactionError.message);
      return false;
    }

    // Test subscriptions table
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1);
    
    if (subscriptionError) {
      console.error('Error accessing subscriptions:', subscriptionError.message);
      return false;
    }

    console.log('Payment tables accessible:', {
      transactions,
      subscriptions,
    });
    return true;
  } catch (error) {
    console.error('Payment tables test error:', error);
    return false;
  }
} 