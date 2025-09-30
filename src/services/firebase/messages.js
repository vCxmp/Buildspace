import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    where
} from 'firebase/firestore';
import { db } from './config';

/**
 * Send a message in a match
 * @param {string} matchId - The ID of the match
 * @param {string} senderId - The ID of the sender
 * @param {string} senderName - The name of the sender
 * @param {string} text - The message text
 * @returns {Promise<string>} The ID of the created message
 */
export const sendMessage = async (matchId, senderId, senderName, text) => {
  try {
    const messagesRef = collection(db, 'matches', matchId, 'messages');
    const docRef = await addDoc(messagesRef, {
      senderId,
      senderName,
      text,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get all matches for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} Array of matches with last message
 */
export const getUserMatches = async (userId) => {
  try {
    console.log('Getting matches for user:', userId);
    const matchesRef = collection(db, 'matches');
    const q = query(
      matchesRef,
      where('participants', 'array-contains', userId),
      where('status', '==', 'active')
    );
    
    console.log('Executing query for matches...');
    const snapshot = await getDocs(q);
    console.log('Found matches:', snapshot.docs.length);
    
    if (snapshot.empty) {
      console.log('No matches found in Firestore');
      return [];
    }

    // Create a Map to store unique matches by participant pair
    const uniqueMatches = new Map();

    for (const matchDoc of snapshot.docs) {
      const matchData = matchDoc.data();
      console.log('Processing match:', { id: matchDoc.id, data: matchData });
      
      // Get the other participant's info
      const otherUserId = matchData.participants.find(id => id !== userId);
      console.log('Other user ID:', otherUserId);

      // Create a unique key for the participant pair
      const participantKey = [userId, otherUserId].sort().join('_');

      // Only keep the most recent match if there are duplicates
      if (!uniqueMatches.has(participantKey) || 
          matchData.createdAt > uniqueMatches.get(participantKey).createdAt) {
        let otherUserData = null;

        try {
          // Try to get user data from either sponsors or athletes collection
          const sponsorRef = doc(db, 'sponsors', otherUserId);
          const athleteRef = doc(db, 'athletes', otherUserId);
          
          console.log('Fetching user data from both collections...');
          const [sponsorDoc, athleteDoc] = await Promise.all([
            getDoc(sponsorRef),
            getDoc(athleteRef)
          ]);

          console.log('Documents found:', {
            sponsorExists: sponsorDoc.exists(),
            athleteExists: athleteDoc.exists()
          });

          if (sponsorDoc.exists()) {
            const sponsorData = sponsorDoc.data();
            console.log('Found sponsor data:', sponsorData);
            otherUserData = {
              name: sponsorData.companyName,
              profilePhotoUrl: sponsorData.logoUrl
            };
          } else if (athleteDoc.exists()) {
            const athleteData = athleteDoc.data();
            console.log('Found athlete data:', athleteData);
            otherUserData = {
              name: athleteData.fullName,
              profilePhotoUrl: athleteData.profileImageUrl
            };
          }
        } catch (error) {
          console.error('Error getting other user data:', error);
        }

        // If we couldn't get the other user's data, use the match data
        if (!otherUserData) {
          console.log('Using fallback user data from match document');
          otherUserData = {
            name: userId === matchData.sponsorId ? matchData.athleteName : matchData.sponsorName,
            profilePhotoUrl: null
          };
        }

        // Get the last message
        const messagesRef = collection(db, 'matches', matchDoc.id, 'messages');
        const messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
        const messagesSnapshot = await getDocs(messagesQuery);
        const lastMessage = messagesSnapshot.docs[0]?.data();

        const match = {
          id: matchDoc.id,
          otherUser: {
            id: otherUserId,
            name: otherUserData.name,
            profilePhotoUrl: otherUserData.profilePhotoUrl
          },
          lastMessage: lastMessage ? {
            text: lastMessage.text,
            createdAt: lastMessage.createdAt?.toDate(),
            senderId: lastMessage.senderId
          } : null,
          createdAt: matchData.createdAt
        };

        console.log('Processed match:', match);
        uniqueMatches.set(participantKey, match);
      }
    }

    // Convert Map values to array and sort by creation date
    const matches = Array.from(uniqueMatches.values())
      .sort((a, b) => b.createdAt - a.createdAt);

    console.log('Returning unique matches:', matches);
    return matches;
  } catch (error) {
    console.error('Error getting user matches:', error);
    throw error;
  }
};

/**
 * Subscribe to messages in a match
 * @param {string} matchId - The ID of the match
 * @param {Function} callback - Function to call with new messages
 * @returns {Function} Unsubscribe function
 */
export const subscribeToMessages = (matchId, callback) => {
  const messagesRef = collection(db, 'matches', matchId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      _id: doc.id,
      text: doc.data().text,
      createdAt: doc.data().createdAt?.toDate(),
      user: {
        _id: doc.data().senderId,
        name: doc.data().senderName
      }
    }));
    callback(messages);
  });
}; 