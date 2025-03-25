import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EventDetails() {
  const { id } = useLocalSearchParams();

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: 'https://via.placeholder.com/400x200' }}
        style={styles.coverImage}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Event Name</Text>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={20} color="#666" />
          <Text style={styles.dateText}>March 15, 2024 • 7:00 PM</Text>
        </View>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <Text style={styles.locationText}>123 Event Street, New York, NY</Text>
        </View>
        <Text style={styles.description}>
          This is a detailed description of the event. It can include information about what will happen, who should attend, and what to bring.
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>$25.00</Text>
          <TouchableOpacity style={styles.buyButton}>
            <Text style={styles.buyButtonText}>Buy Tickets</Text>
          </TouchableOpacity>
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
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  buyButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 