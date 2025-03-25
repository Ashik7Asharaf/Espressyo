import React from 'react';
import { View, Text, StyleSheet, Platform, Image, Pressable } from 'react-native';
import { ResponsiveLayout } from '../components/ResponsiveLayout';
import { WebHeader } from '../components/WebHeader';

export const WebLanding: React.FC = () => {
  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.container}>
      <WebHeader />
      <ResponsiveLayout>
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.title}>Support Creators,{'\n'}Build Communities</Text>
            <Text style={styles.subtitle}>
              Esspress Yo is the ultimate platform for creators and their supporters to connect,
              engage, and grow together.
            </Text>
            <View style={styles.ctaContainer}>
              <Pressable style={[styles.button, styles.primaryButton]}>
                <Text style={styles.primaryButtonText}>Get Started</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.secondaryButton]}>
                <Text style={styles.secondaryButtonText}>Learn More</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.heroImageContainer}>
            {/* Placeholder for hero image */}
            <View style={styles.heroImagePlaceholder} />
          </View>
        </View>

        <View style={styles.features}>
          <Text style={styles.sectionTitle}>Why Esspress Yo?</Text>
          <View style={styles.featureGrid}>
            {[
              {
                title: 'Hybrid Monetization',
                description: 'Combine one-time tips with flexible subscription tiers',
              },
              {
                title: 'Interactive Community',
                description: 'Engage with live Q&As, discussion hubs, and polls',
              },
              {
                title: 'Gamification',
                description: 'Earn rewards with supporter streaks and badges',
              },
              {
                title: 'AI-Powered Discovery',
                description: 'Find creators that match your interests',
              },
            ].map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>
      </ResponsiveLayout>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  hero: {
    flexDirection: 'row',
    paddingVertical: 80,
    gap: 48,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 20,
    color: '#666666',
    marginBottom: 32,
    lineHeight: 28,
  },
  ctaContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
  },
  secondaryButtonText: {
    color: '#1a1a1a',
    fontSize: 18,
    fontWeight: '600',
  },
  heroImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImagePlaceholder: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  features: {
    paddingVertical: 80,
  },
  sectionTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 48,
    textAlign: 'center',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  featureCard: {
    flex: 1,
    minWidth: 250,
    backgroundColor: '#f9f9f9',
    padding: 24,
    borderRadius: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
}); 