import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getPersonalizedFeed, getTrendingPosts } from '../services/deepseek';

export default function DeepSeekTest() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedData, setFeedData] = useState<any>(null);

  useEffect(() => {
    const testDeepSeekAPI = async () => {
      try {
        setLoading(true);
        // Test with a dummy user ID for now
        const feed = await getPersonalizedFeed('test-user-123');
        setFeedData(feed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch feed');
      } finally {
        setLoading(false);
      }
    };

    testDeepSeekAPI();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.text}>Testing DeepSeek API...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.success}>DeepSeek API Test Successful!</Text>
      <Text style={styles.text}>
        Feed contains {feedData?.data?.personalizedFeed?.length || 0} posts
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  error: {
    color: '#ff3b30',
    fontSize: 16,
    textAlign: 'center',
  },
  success: {
    color: '#34c759',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 