import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Animated
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { getAllAthletes, handleAthleteAction } from '../services/firebase/athletes';
import { getAllSponsors, handleSponsorAction, checkForMatch } from '../services/firebase/sponsors';
import { auth } from '../services/firebase/config';
import { getUserType } from '../services/firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { router } from 'expo-router';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase/config';

const { width } = Dimensions.get('window');

const FeedScreen = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const lastActionRef = useRef(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const currentIndex = useRef(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadUserAndData();
      } else {
        setCurrentUser(null);
        setUserType(null);
        setProfiles([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserAndData = async () => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Error', 'Please log in to view profiles');
        return;
      }

      const type = await getUserType(user.uid);
      
      if (!type) {
        Alert.alert('Error', 'User type not found. Please contact support.');
        return;
      }

      setCurrentUser(user);
      setUserType(type);

      if (type === 'sponsor') {
        const athletesData = await getAllAthletes();
        
        if (!athletesData || athletesData.length === 0) {
          Alert.alert('No Profiles', 'There are no athlete profiles available at the moment.');
          return;
        }
        
        setProfiles(athletesData);
      } else if (type === 'athlete') {
        const sponsorsData = await getAllSponsors();
        
        if (!sponsorsData || sponsorsData.length === 0) {
          Alert.alert('No Profiles', 'There are no sponsor profiles available at the moment.');
          return;
        }
        
        setProfiles(sponsorsData);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profiles: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction, profile) => {
    if (!currentUser || isSwiping) {
      return;
    }

    const actionKey = `${profile.id}-${direction}`;
    if (lastActionRef.current === actionKey) {
      return;
    }

    setIsSwiping(true);
    lastActionRef.current = actionKey;

    try {
      let isMatch = false;
      let matchData = null;

      if (userType === 'sponsor') {
        // For sponsors: profile.id is the athlete's user ID
        await handleSponsorAction(currentUser.uid, direction, profile.id);
        if (direction === 'like') {
          // Check if the athlete has liked the sponsor
          const matchResult = await checkForMatch(currentUser.uid, profile.id);
          isMatch = matchResult.isMatch;
          matchData = matchResult.matchData;
        }
      } else {
        // For athletes: profile.id is the sponsor's user ID
        await handleAthleteAction(currentUser.uid, direction, profile.id);
        if (direction === 'like') {
          // Check if the sponsor has liked the athlete
          const matchResult = await checkForMatch(profile.id, currentUser.uid);
          isMatch = matchResult.isMatch;
          matchData = matchResult.matchData;
        }
      }
      
      if (direction === 'like') {
        if (isMatch) {
          Alert.alert(
            'It\'s a Match! 🎉',
            `You matched with ${userType === 'sponsor' ? profile.fullName : profile.companyName}!`,
            [
              {
                text: 'View Match',
                onPress: () => {
                  router.push({
                    pathname: '/match',
                    params: { 
                      matchId: matchData.id,
                      sponsorName: matchData.sponsorName,
                      athleteName: matchData.athleteName
                    }
                  });
                }
              },
              {
                text: 'Keep Browsing',
                style: 'cancel'
              }
            ]
          );
        } else {
          Alert.alert('Liked', `You liked ${userType === 'sponsor' ? profile.fullName : profile.companyName}`);
        }
      } else {
        Alert.alert('Passed', `You passed on ${userType === 'sponsor' ? profile.fullName : profile.companyName}`);
      }

      setProfiles(prevProfiles => 
        prevProfiles.filter(p => p.id !== profile.id)
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSwiping(false);
      setTimeout(() => {
        lastActionRef.current = null;
      }, 1000);
    }
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  );

  const handleSnap = (index) => {
    currentIndex.current = index;
    
    if (index === profiles.length - 1) {
      Alert.alert('No More Profiles', 'You have viewed all available profiles');
    }
  };

  const renderCard = ({ item: profile }) => {
    if (!profile) {
      return null;
    }

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: userType === 'sponsor' ? profile.profileImageUrl : profile.logoUrl }}
          style={styles.profileImage}
        />
        <View style={styles.infoContainer}>
          {userType === 'sponsor' ? (
            <>
              <Text style={styles.name}>{profile.fullName}</Text>
              <Text style={styles.sport}>{profile.sport} • {profile.position}</Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Height</Text>
                  <Text style={styles.statValue}>{profile.height} ft</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Weight</Text>
                  <Text style={styles.statValue}>{profile.weight} lbs</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>GPA</Text>
                  <Text style={styles.statValue}>{profile.gpa}</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Achievements</Text>
              <Text style={styles.achievements}>{profile.achievements}</Text>

              <Text style={styles.sectionTitle}>Graduation Year</Text>
              <Text style={styles.graduationYear}>{profile.graduationYear}</Text>
            </>
          ) : (
            <>
              <Text style={styles.name}>{profile.companyName}</Text>
              <Text style={styles.sport}>{profile.industry}</Text>
              
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{profile.description}</Text>

              <Text style={styles.sectionTitle}>Budget Range</Text>
              <Text style={styles.budget}>
                ${profile.minBudget} - ${profile.maxBudget}
              </Text>

              {profile.website && (
                <>
                  <Text style={styles.sectionTitle}>Website</Text>
                  <Text style={styles.website}>{profile.website}</Text>
                </>
              )}
            </>
          )}

          <View style={styles.swipeButtons}>
            <TouchableOpacity 
              style={[styles.swipeButton, styles.passButton]}
              onPress={() => handleSwipe('pass', profile)}
            >
              <Text style={styles.swipeButtonText}>✕</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.swipeButton, styles.likeButton]}
              onPress={() => handleSwipe('like', profile)}
            >
              <Text style={styles.swipeButtonText}>♥</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profiles...</Text>
      </View>
    );
  }

  if (!userType) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Access Denied</Text>
        <Text style={styles.subText}>Please contact support to set up your account type.</Text>
      </View>
    );
  }

  if (profiles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No profiles available</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadUserAndData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Carousel
        loop={false}
        width={width}
        height={Dimensions.get('window').height * 0.9}
        data={profiles}
        scrollAnimationDuration={200}
        renderItem={renderCard}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        onScroll={handleScroll}
        onSnapToItem={handleSnap}
        panGestureHandlerProps={{
          activeOffsetX: [-5, 5],
          failOffsetY: [-10, 10],
        }}
        defaultIndex={0}
        enabled={!isSwiping}
        style={{
          width: width,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        vertical={false}
        autoPlay={false}
        autoPlayInterval={0}
        snapEnabled={true}
        snapToInterval={width}
        snapToAlignment="center"
        decelerationRate="fast"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    width: width * 0.95,
    height: '90%',
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileImage: {
    width: '100%',
    height: '50%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  infoContainer: {
    padding: 20,
    width: '100%',
    height: '50%',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sport: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  achievements: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  graduationYear: {
    fontSize: 15,
    color: '#444',
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 10,
  },
  budget: {
    fontSize: 16,
    color: '#444',
    fontWeight: '600',
    marginBottom: 10,
  },
  website: {
    fontSize: 15,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  swipeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  swipeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  passButton: {
    backgroundColor: '#FF5252',
  },
  likeButton: {
    backgroundColor: '#4CAF50',
  },
  swipeButtonText: {
    fontSize: 28,
    color: 'white',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default FeedScreen; 