import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CommunityDetails() {
  const { id } = useLocalSearchParams();

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: 'https://via.placeholder.com/400x200' }}
        style={styles.coverImage}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Community Name</Text>
        <Text style={styles.description}>
          This is a description of the community. It can be multiple lines long and contain details about what the community is about.
        </Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="people-outline" size={24} color="#666" />
            <Text style={styles.statText}>1.2k members</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={24} color="#666" />
            <Text style={styles.statText}>Founded 2024</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="location-outline" size={24} color="#666" />
            <Text style={styles.statText}>New York, USA</Text>
          </View>
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
    lineHeight: 24,
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
}); 