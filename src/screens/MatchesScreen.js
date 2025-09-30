import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import { auth, db } from '../services/firebase/config';
import { getUserMatches } from '../services/firebase/messages';

const MatchesScreen = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('MatchesScreen mounted');
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const userId = auth.currentUser?.uid;
      console.log('Loading matches for user:', userId);
      
      if (!userId) {
        console.log('No user ID found');
        return;
      }

      // First, let's check if there are any matches in Firestore
      const matchesRef = collection(db, 'matches');
      const q = query(
        matchesRef,
        where('participants', 'array-contains', userId)
      );
      
      const snapshot = await getDocs(q);
      console.log('Raw matches in Firestore:', snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));

      const userMatches = await getUserMatches(userId);
      console.log('Loaded matches:', userMatches);
      setMatches(userMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = (matchId, otherUserName) => {
    console.log('Chat pressed:', { matchId, otherUserName });
    router.push({
      pathname: '/chat',
      params: { 
        matchId,
        otherUserName
      }
    });
  };

  const renderMatchItem = ({ item }) => {
    console.log('Rendering match item:', item);
    return (
      <TouchableOpacity
        style={styles.matchItem}
        onPress={() => handleChatPress(item.id, item.otherUser.name)}
      >
        <Image
          source={{ uri: item.otherUser.profilePhotoUrl }}
          style={styles.profilePic}
        />
        <View style={styles.matchInfo}>
          <Text style={styles.name}>{item.otherUser.name}</Text>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => handleChatPress(item.id, item.otherUser.name)}
          >
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="Your Matches" />
      
      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No matches yet</Text>
          <Text style={styles.emptySubtext}>
            Keep swiping to find your perfect match!
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={loadMatches}
        />
      )}
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
  list: {
    padding: 16,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  matchInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  chatButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
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

export default MatchesScreen; 