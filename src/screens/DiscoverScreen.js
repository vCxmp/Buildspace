import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import { auth, db } from '../services/firebase/config';
import { getAllSponsors } from '../services/firebase/sponsors';

const DiscoverScreen = () => {
  const [sponsors, setSponsors] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadSponsors();
  }, []);

  const loadSponsors = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      // First, get all matches for the current user
      const matchesRef = collection(db, 'matches');
      const matchesQuery = query(
        matchesRef,
        where('participants', 'array-contains', userId)
      );
      
      const matchesSnapshot = await getDocs(matchesQuery);
      const matchedUserIds = new Set();
      
      // Add all matched users to the set
      matchesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        data.participants.forEach(id => {
          if (id !== userId) {
            matchedUserIds.add(id);
          }
        });
      });

      console.log('Current user ID:', userId);
      console.log('Matched user IDs:', Array.from(matchedUserIds));

      // Get all sponsors
      const allSponsors = await getAllSponsors();
      console.log('All sponsors before filtering:', allSponsors.map(s => ({ id: s.id, name: s.companyName })));
      
      // Filter out already matched sponsors and the current user
      const filteredSponsors = allSponsors.filter(sponsor => {
        const isMatched = matchedUserIds.has(sponsor.id);
        const isCurrentUser = sponsor.id === userId;
        const shouldShow = !isMatched && !isCurrentUser;
        
        if (!shouldShow) {
          console.log('Filtering out sponsor:', {
            id: sponsor.id,
            name: sponsor.companyName,
            reason: isMatched ? 'already matched' : 'current user'
          });
        }
        
        return shouldShow;
      });

      console.log('Total sponsors:', allSponsors.length);
      console.log('Filtered sponsors:', filteredSponsors.length);
      console.log('Filtered sponsors:', filteredSponsors.map(s => ({ id: s.id, name: s.companyName })));
      
      setSponsors(filteredSponsors);
    } catch (error) {
      console.error('Error loading sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    // Handle like action
    setCurrentIndex(prev => prev + 1);
  };

  const handlePass = async () => {
    // Handle pass action
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (currentIndex >= sponsors.length) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Discover" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No more profiles to show</Text>
          <Text style={styles.emptySubtext}>
            Check back later for new opportunities!
          </Text>
        </View>
      </View>
    );
  }

  const currentSponsor = sponsors[currentIndex];

  return (
    <View style={styles.container}>
      <CustomHeader title="Discover" />
      <View style={styles.card}>
        <Image
          source={{ uri: currentSponsor.logoUrl }}
          style={styles.logo}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{currentSponsor.companyName}</Text>
          <Text style={styles.industry}>{currentSponsor.industry}</Text>
          <Text style={styles.description}>{currentSponsor.description}</Text>
          <View style={styles.budgetContainer}>
            <Text style={styles.budgetLabel}>Budget Range:</Text>
            <Text style={styles.budget}>
              ${currentSponsor.minBudget} - ${currentSponsor.maxBudget}
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.passButton]}
            onPress={handlePass}
          >
            <Text style={styles.buttonText}>Pass</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.likeButton]}
            onPress={handleLike}
          >
            <Text style={styles.buttonText}>Like</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  industry: {
    fontSize: 18,
    color: '#4B5563',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 24,
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  budgetLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563',
    marginRight: 8,
  },
  budget: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  passButton: {
    backgroundColor: '#EF4444',
  },
  likeButton: {
    backgroundColor: '#1E3A8A',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default DiscoverScreen; 