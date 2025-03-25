import { StyleSheet, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text } from '../../components/Themed';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Creators</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Creators</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          {[1, 2, 3].map((item) => (
            <TouchableOpacity key={item} style={styles.featuredCard}>
              <Image
                source={{ uri: `https://via.placeholder.com/150x200` }}
                style={styles.featuredImage}
              />
              <View style={styles.featuredInfo}>
                <Text style={styles.creatorName}>Creator {item}</Text>
                <Text style={styles.creatorCategory}>Category</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trending Now</Text>
        {[1, 2, 3].map((item) => (
          <TouchableOpacity key={item} style={styles.trendingItem}>
            <Image
              source={{ uri: `https://via.placeholder.com/50` }}
              style={styles.trendingImage}
            />
            <View style={styles.trendingInfo}>
              <Text style={styles.trendingTitle}>Trending Post {item}</Text>
              <Text style={styles.trendingAuthor}>by Creator {item}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended for You</Text>
        {[1, 2, 3].map((item) => (
          <TouchableOpacity key={item} style={styles.recommendedItem}>
            <Image
              source={{ uri: `https://via.placeholder.com/60` }}
              style={styles.recommendedImage}
            />
            <View style={styles.recommendedInfo}>
              <Text style={styles.recommendedName}>Creator {item}</Text>
              <Text style={styles.recommendedBio}>Short bio description</Text>
            </View>
            <TouchableOpacity style={styles.supportButton}>
              <Text style={styles.supportButtonText}>Support</Text>
            </TouchableOpacity>
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchButton: {
    padding: 8,
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
  featuredScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  featuredCard: {
    width: 150,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredInfo: {
    padding: 10,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  creatorCategory: {
    fontSize: 14,
    color: '#666',
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  trendingImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  trendingInfo: {
    flex: 1,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  trendingAuthor: {
    fontSize: 14,
    color: '#666',
  },
  recommendedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  recommendedImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  recommendedInfo: {
    flex: 1,
  },
  recommendedName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendedBio: {
    fontSize: 14,
    color: '#666',
  },
  supportButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
