import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getCommunityFeed, joinCommunity } from '../services/community';
import { Community, CommunityPost } from '../types/community';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function CommunityDetails() {
  const { id } = useLocalSearchParams();
  const [community, setCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    loadCommunityDetails();
  }, [id]);

  async function loadCommunityDetails() {
    try {
      // Get community details
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', id)
        .single();

      if (communityError) throw communityError;
      setCommunity(communityData as Community);

      // Get community feed
      const { posts } = await getCommunityFeed(id as string);
      setPosts(posts);

      // Check if user is a member
      const { data: user } = await supabase.auth.getUser();
      if (user) {
        const { data: membership } = await supabase
          .from('community_members')
          .select('*')
          .eq('communityId', id)
          .eq('userId', user.user.id)
          .single();
        
        setIsMember(!!membership);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinCommunity() {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) {
        setError('Please sign in to join communities');
        return;
      }

      await joinCommunity(user.user.id, id as string);
      setIsMember(true);
      
      // Refresh community details to update member count
      loadCommunityDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join community');
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading community details...</Text>
      </View>
    );
  }

  if (error || !community) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error || 'Community not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: community.imageUrl || 'https://via.placeholder.com/400' }}
        style={styles.coverImage}
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>{community.name}</Text>
        <Text style={styles.description}>{community.description}</Text>
        
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={24} color="#666" />
            <Text style={styles.statText}>{community.memberCount} members</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="location-outline" size={24} color="#666" />
            <Text style={styles.statText}>{community.location.city}</Text>
          </View>
        </View>

        {!isMember && (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={handleJoinCommunity}
          >
            <Text style={styles.joinButtonText}>Join Community</Text>
          </TouchableOpacity>
        )}

        <View style={styles.tagsContainer}>
          {community.tags.map((tag) => (
            <Text key={tag} style={styles.tag}>#{tag}</Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Recent Posts</Text>
        {posts.map((post) => (
          <View key={post.id} style={styles.post}>
            <Text style={styles.postContent}>{post.content}</Text>
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <Image
                source={{ uri: post.mediaUrls[0] }}
                style={styles.postImage}
              />
            )}
            <View style={styles.postStats}>
              <Text style={styles.postStat}>
                <Ionicons name="heart-outline" size={16} /> {post.likes}
              </Text>
              <Text style={styles.postStat}>
                <Ionicons name="chatbubble-outline" size={16} /> {post.comments}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  statText: {
    marginLeft: 8,
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  tag: {
    fontSize: 14,
    color: '#0066cc',
    marginRight: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  post: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  postContent: {
    fontSize: 16,
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  postStats: {
    flexDirection: 'row',
  },
  postStat: {
    marginRight: 16,
    color: '#666',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    margin: 16,
  },
}); 