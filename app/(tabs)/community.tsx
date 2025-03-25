import { StyleSheet, View, ScrollView } from 'react-native';
import { Text } from '../../components/Themed';

export default function CommunityScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Hub</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Discussions</Text>
        {/* Discussion list will go here */}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {/* Events list will go here */}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Creator Spotlight</Text>
        {/* Featured creators will go here */}
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
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
    marginBottom: 10,
  },
}); 