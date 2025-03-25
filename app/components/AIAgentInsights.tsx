import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { AIAgent } from '../services/aiAgent';
import { Creator, Post, Community } from '../types/feed';

interface AIAgentInsightsProps {
  userId: string;
  creatorId?: string;
  posts?: Post[];
  interactions?: any[];
}

export const AIAgentInsights: React.FC<AIAgentInsightsProps> = ({
  userId,
  creatorId,
  posts,
  interactions,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<any>(null);
  const aiAgent = AIAgent.getInstance();

  useEffect(() => {
    loadInsights();
  }, [userId, creatorId, posts, interactions]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      if (creatorId && posts) {
        // Load creator insights
        const response = await aiAgent.getCreatorInsights(creatorId, posts);
        if (response.success) {
          setInsights(response.data);
        } else {
          setError(response.message || 'Failed to load creator insights');
        }
      } else if (interactions) {
        // Load fan preferences
        const response = await aiAgent.getFanPreferences(userId, interactions);
        if (response.success) {
          setInsights(response.data);
        } else {
          setError(response.message || 'Failed to load fan preferences');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error loading insights:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!insights) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>No insights available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {creatorId ? (
        // Creator Insights View
        <View>
          <Text style={styles.sectionTitle}>Content Performance</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Best Performing Posts</Text>
            {insights.contentPerformance.bestPerformingPosts.map((post: Post, index: number) => (
              <View key={post.id} style={styles.postItem}>
                <Text style={styles.postTitle}>{post.content.substring(0, 100)}...</Text>
                <Text style={styles.postStats}>
                  Likes: {post.likes} | Comments: {post.comments.length}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Audience Insights</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Peak Engagement Times</Text>
            {insights.audienceInsights.peakEngagementTimes.map((time: string, index: number) => (
              <Text key={index} style={styles.listItem}>{time}</Text>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Content Ideas</Text>
            {insights.recommendations.content.map((rec: string, index: number) => (
              <Text key={index} style={styles.listItem}>{rec}</Text>
            ))}
          </View>
        </View>
      ) : (
        // Fan Preferences View
        <View>
          <Text style={styles.sectionTitle}>Your Interests</Text>
          <View style={styles.card}>
            {insights.interests.map((interest: string, index: number) => (
              <Text key={index} style={styles.listItem}>{interest}</Text>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Recommended Creators</Text>
          <View style={styles.card}>
            {insights.recommendations.creators.map((creator: Creator) => (
              <View key={creator.id} style={styles.creatorItem}>
                <Text style={styles.creatorName}>{creator.name}</Text>
                <Text style={styles.creatorBio}>{creator.bio}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Recommended Communities</Text>
          <View style={styles.card}>
            {insights.recommendations.communities.map((community: Community) => (
              <View key={community.id} style={styles.communityItem}>
                <Text style={styles.communityName}>{community.name}</Text>
                <Text style={styles.communityDescription}>{community.description}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#444',
  },
  postItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  postTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  postStats: {
    fontSize: 12,
    color: '#999',
  },
  listItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  creatorItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  creatorBio: {
    fontSize: 14,
    color: '#666',
  },
  communityItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  communityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  communityDescription: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
    textAlign: 'center',
  },
  noDataText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
}); 