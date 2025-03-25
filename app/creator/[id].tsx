import { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Text } from '../../components/Themed';
import { supabase } from '../../lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type CreatorProfile = {
  id: string;
  name: string;
  bio: string;
  avatar_url: string;
  category: string;
  supporters_count: number;
  rating: number;
  posts: any[];
};

export default function CreatorProfileScreen() {
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCreatorProfile();
  }, [id]);

  async function fetchCreatorProfile() {
    try {
      // In a real app, you would fetch this from Supabase
      // This is mock data for demonstration
      setProfile({
        id: id as string,
        name: 'John Doe',
        bio: 'Digital creator passionate about art and technology. Creating content that inspires and educates.',
        avatar_url: 'https://via.placeholder.com/150',
        category: 'Art & Technology',
        supporters_count: 1234,
        rating: 4.8,
        posts: [],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load creator profile');
    } finally {
      setLoading(false);
    }
  }

  const handleSupport = () => {
    router.push(`/support/${id}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Creator not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.category}>{profile.category}</Text>
        </View>
      </View>

      <View style={styles.bioContainer}>
        <Text style={styles.bio}>{profile.bio}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{profile.supporters_count}</Text>
          <Text style={styles.statLabel}>Supporters</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{profile.rating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.supportButton} onPress={handleSupport}>
        <Ionicons name="heart" size={24} color="#fff" style={styles.supportIcon} />
        <Text style={styles.supportButtonText}>Support Creator</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Posts</Text>
        {profile.posts.length === 0 ? (
          <Text style={styles.emptyText}>No posts yet</Text>
        ) : (
          profile.posts.map((post, index) => (
            <View key={index} style={styles.postCard}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postDate}>{post.date}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support Tiers</Text>
        <View style={styles.tierCard}>
          <Text style={styles.tierTitle}>Basic Support</Text>
          <Text style={styles.tierPrice}>$5/month</Text>
          <Text style={styles.tierDescription}>Access to exclusive posts and community</Text>
        </View>
        <View style={styles.tierCard}>
          <Text style={styles.tierTitle}>Premium Support</Text>
          <Text style={styles.tierPrice}>$10/month</Text>
          <Text style={styles.tierDescription}>All basic benefits + direct creator interaction</Text>
        </View>
      </View>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  category: {
    fontSize: 16,
    color: '#666',
  },
  bioContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  supportButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportIcon: {
    marginRight: 10,
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  postCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  postDate: {
    fontSize: 14,
    color: '#666',
  },
  tierCard: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  tierPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 10,
  },
  tierDescription: {
    fontSize: 14,
    color: '#666',
  },
}); 