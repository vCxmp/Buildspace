import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomHeader from '../components/CustomHeader';

const AccountTypeScreen = () => {
  return (
    <View style={styles.container}>
      <CustomHeader title="Choose Account Type" />
      
      <View style={styles.content}>
        <Text style={styles.title}>I am a...</Text>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => router.push('/athlete-auth')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={64} color="#1E3A8A" />
            </View>
            <Text style={styles.optionTitle}>Athlete</Text>
            <Text style={styles.optionDescription}>
              Looking for sponsorship opportunities
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => router.push('/sponsor-auth')}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="business" size={64} color="#1E3A8A" />
            </View>
            <Text style={styles.optionTitle}>Sponsor</Text>
            <Text style={styles.optionDescription}>
              Looking to sponsor athletes
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 24 : 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 24,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 60,
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default AccountTypeScreen; 