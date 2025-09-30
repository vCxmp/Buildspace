import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './config';
import { uploadImage } from './storage';

/**
 * Submit a complete sponsor profile including image upload
 * @param {Object} profileData - The sponsor's profile data
 * @param {string} profileData.companyName - Company name
 * @param {string} profileData.industry - Company industry
 * @param {string} profileData.description - Company description
 * @param {string} profileData.website - Company website
 * @param {string} profileData.imageUri - Local URI of the company logo
 * @param {Array<string>} profileData.preferredSports - Array of preferred sports
 * @param {number} profileData.minBudget - Minimum sponsorship budget
 * @param {number} profileData.maxBudget - Maximum sponsorship budget
 * @param {Array<string>} profileData.preferredColleges - Array of preferred colleges
 * @param {string} userId - The user ID of the sponsor
 * @returns {Promise<string>} The document ID of the created sponsor profile
 */
export const submitSponsorProfile = async (profileData, userId) => {
  try {
    const {
      companyName,
      industry,
      description,
      website,
      imageUri,
      preferredSports,
      minBudget,
      maxBudget,
      preferredColleges
    } = profileData;

    // Validate required fields
    if (!companyName || !industry || !description || !imageUri) {
      throw new Error("Company name, industry, description, and logo are required");
    }

    // Validate budget range
    if (minBudget && maxBudget && minBudget > maxBudget) {
      throw new Error("Minimum budget cannot be greater than maximum budget");
    }

    // Upload the company logo
    const fileName = `sponsor-logo-${userId}.jpg`;
    const logoUrl = await uploadImage(
      imageUri,
      'sponsors/logos',
      fileName
    );

    // Create the sponsor profile using userId as document ID
    const sponsorRef = doc(db, 'sponsors', userId);
    await setDoc(sponsorRef, {
      companyName,
      industry,
      description,
      website,
      logoUrl,
      preferredSports: preferredSports || [],
      minBudget: minBudget || 0,
      maxBudget: maxBudget || 0,
      preferredColleges: preferredColleges || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: [],
      passes: []
    });

    return userId;
  } catch (error) {
    console.error("Error submitting sponsor profile:", error);
    throw error;
  }
};

// Get all sponsor profiles
export const getAllSponsors = async () => {
  try {
    const sponsorsRef = collection(db, 'sponsors');
    const snapshot = await getDocs(sponsorsRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting sponsors:', error);
    throw error;
  }
};

// Check for a match between sponsor and athlete
export const checkForMatch = async (sponsorId, athleteId) => {
  try {
    console.log('Checking for match between:', { sponsorId, athleteId });
    
    // First, check if a match already exists between these users
    const matchesRef = collection(db, 'matches');
    const existingMatchQuery = query(
      matchesRef,
      where('participants', 'array-contains', sponsorId),
      where('status', '==', 'active')
    );
    
    const existingMatches = await getDocs(existingMatchQuery);
    const matchExists = existingMatches.docs.some(doc => {
      const data = doc.data();
      return data.participants.includes(athleteId);
    });

    if (matchExists) {
      console.log('Match already exists between these users');
      return { isMatch: true };
    }
    
    // Get both documents
    const sponsorRef = doc(db, 'sponsors', sponsorId);
    const athleteRef = doc(db, 'athletes', athleteId);
    
    const [sponsorDoc, athleteDoc] = await Promise.all([
      getDoc(sponsorRef),
      getDoc(athleteRef)
    ]);

    console.log('Documents found:', {
      sponsorExists: sponsorDoc.exists(),
      athleteExists: athleteDoc.exists()
    });

    if (!sponsorDoc.exists()) {
      throw new Error(`Sponsor not found with ID: ${sponsorId}`);
    }
    if (!athleteDoc.exists()) {
      throw new Error(`Athlete not found with ID: ${athleteId}`);
    }

    const sponsorData = sponsorDoc.data();
    const athleteData = athleteDoc.data();

    console.log('Document data:', {
      sponsorLikes: sponsorData.likes || [],
      athleteLikes: athleteData.likes || []
    });

    // Check if both have liked each other
    const sponsorLikes = sponsorData.likes || [];
    const athleteLikes = athleteData.likes || [];

    const isMatch = sponsorLikes.includes(athleteId) && athleteLikes.includes(sponsorId);

    console.log('Match result:', { isMatch });

    if (isMatch) {
      // Create a match document
      const matchRef = await addDoc(collection(db, 'matches'), {
        participants: [sponsorId, athleteId],
        sponsorId,
        athleteId,
        sponsorName: sponsorData.companyName,
        athleteName: athleteData.fullName,
        createdAt: serverTimestamp(),
        status: 'active',
        lastMessage: null
      });

      console.log('Created new match:', { matchId: matchRef.id });

      return {
        isMatch: true,
        matchData: {
          id: matchRef.id,
          sponsorName: sponsorData.companyName,
          athleteName: athleteData.fullName
        }
      };
    }

    return { isMatch: false };
  } catch (error) {
    console.error('Error checking for match:', error);
    throw error;
  }
};

// Handle sponsor action (like/pass)
export const handleSponsorAction = async (sponsorId, action, userId) => {
  try {
    console.log('Handling sponsor action:', { sponsorId, action, userId });
    
    const sponsorRef = doc(db, 'sponsors', sponsorId);
    const sponsorDoc = await getDoc(sponsorRef);
    
    if (!sponsorDoc.exists()) {
      throw new Error(`Sponsor not found with ID: ${sponsorId}`);
    }

    const sponsorData = sponsorDoc.data();
    const likes = sponsorData.likes || [];
    const passes = sponsorData.passes || [];

    if (action === 'like') {
      // Add to likes if not already there
      if (!likes.includes(userId)) {
        await updateDoc(sponsorRef, {
          likes: [...likes, userId],
          updatedAt: serverTimestamp()
        });
        console.log('Added like to sponsor:', { sponsorId, userId });
      }
    } else if (action === 'pass') {
      // Add to passes if not already there
      if (!passes.includes(userId)) {
        await updateDoc(sponsorRef, {
          passes: [...passes, userId],
          updatedAt: serverTimestamp()
        });
        console.log('Added pass to sponsor:', { sponsorId, userId });
      }
    }

    return true;
  } catch (error) {
    console.error('Error handling sponsor action:', error);
    throw error;
  }
}; 