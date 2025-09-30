import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, where, getDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, storage } from './config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Add a new athlete profile to Firestore
 * @param {Object} athleteData - The athlete's data
 * @param {string} athleteData.name - Athlete's full name
 * @param {string} athleteData.college - Athlete's college/university
 * @param {string} athleteData.sport - Athlete's sport
 * @param {number} athleteData.amountRequested - Amount requested for sponsorship
 * @param {string} athleteData.profilePhotoUrl - URL of the athlete's profile photo
 * @returns {Promise<string>} The ID of the newly created document
 */
export const addAthleteProfile = async (athleteData) => {
  try {
    const docRef = await addDoc(collection(db, "athletes"), {
      ...athleteData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("Athlete profile created with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding athlete profile: ", error);
    throw error;
  }
};

/**
 * Submit a complete athlete profile including image upload
 * @param {Object} profileData - The athlete's profile data
 * @param {string} profileData.name - Athlete's full name
 * @param {string} profileData.college - Athlete's college/university
 * @param {string} profileData.sport - Athlete's sport
 * @param {number} profileData.amountRequested - Amount requested in dollars
 * @param {string} profileData.imageUri - Local URI of the profile image
 * @param {string} userId - The ID of the current user (sponsor)
 * @returns {Promise<string>} The ID of the newly created document
 */
export const submitAthleteProfile = async (profileData, userId) => {
  try {
    // 1. Upload profile photo to Firebase Storage
    const imageRef = ref(storage, `athlete-profiles/${userId}`);
    const response = await fetch(profileData.imageUri);
    const blob = await response.blob();
    await uploadBytes(imageRef, blob);
    
    // 2. Get the download URL for the uploaded image
    const imageUrl = await getDownloadURL(imageRef);

    // 3. Add profile data to Firestore using userId as document ID
    const athleteRef = doc(db, 'athletes', userId);
    await setDoc(athleteRef, {
      fullName: profileData.fullName,
      sport: profileData.sport,
      position: profileData.position,
      height: profileData.height,
      weight: profileData.weight,
      graduationYear: profileData.graduationYear,
      gpa: profileData.gpa,
      achievements: profileData.achievements,
      preferredColleges: profileData.preferredColleges,
      profileImageUrl: imageUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: [],
      passes: []
    });

    return userId;
  } catch (error) {
    console.error('Error submitting athlete profile:', error);
    throw error;
  }
};

/**
 * Submit a sponsorship offer to an athlete
 * @param {string} athleteId - The ID of the athlete to submit the offer to
 * @param {Object} offerData - The offer details
 * @param {string} offerData.companyName - Name of the sponsoring company
 * @param {number} offerData.offerAmount - Amount of the sponsorship offer in dollars
 * @returns {Promise<string>} The ID of the newly created offer document
 */
export const submitSponsorshipOffer = async (athleteId, offerData) => {
  try {
    const { companyName, offerAmount } = offerData;

    // Validate required fields
    if (!athleteId || !companyName || !offerAmount) {
      throw new Error("Athlete ID, company name, and offer amount are required");
    }

    // Validate offer amount is positive
    if (offerAmount <= 0) {
      throw new Error("Offer amount must be greater than 0");
    }

    // Create a reference to the offers subcollection for this athlete
    const offersRef = collection(db, "athletes", athleteId, "offers");

    // Add the offer document
    const docRef = await addDoc(offersRef, {
      companyName,
      offerAmount,
      status: "pending", // You might want to track the status of offers
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log("Sponsorship offer submitted successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error submitting sponsorship offer:", error);
    throw error;
  }
};

/**
 * Retrieve all athlete profiles from Firestore
 * @returns {Promise<Array<{
 *   id: string,
 *   name: string,
 *   college: string,
 *   sport: string,
 *   amountRequested: number,
 *   profilePhotoUrl: string,
 *   createdAt: Date,
 *   updatedAt: Date
 * }>>} Array of athlete profiles
 */
export const getAllAthletes = async () => {
  try {
    const athletesRef = collection(db, 'athletes');
    const snapshot = await getDocs(athletesRef);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting athletes:', error);
    throw error;
  }
};

/**
 * Handle a like or pass action for an athlete profile
 * @param {string} athleteId - The ID of the athlete being liked/passed
 * @param {string} action - Either 'like' or 'pass'
 * @param {string} userId - The ID of the current user (sponsor)
 * @returns {Promise<void>}
 */
export const handleAthleteAction = async (athleteId, action, userId) => {
  try {
    console.log('Handling athlete action:', { athleteId, action, userId });
    
    const athleteRef = doc(db, 'athletes', athleteId);
    const athleteDoc = await getDoc(athleteRef);
    
    if (!athleteDoc.exists()) {
      throw new Error(`Athlete not found with ID: ${athleteId}`);
    }

    const athleteData = athleteDoc.data();
    const likes = athleteData.likes || [];
    const passes = athleteData.passes || [];

    if (action === 'like') {
      // Add to likes if not already there
      if (!likes.includes(userId)) {
        await updateDoc(athleteRef, {
          likes: [...likes, userId],
          updatedAt: serverTimestamp()
        });
        console.log('Added like to athlete:', { athleteId, userId });
      }
    } else if (action === 'pass') {
      // Add to passes if not already there
      if (!passes.includes(userId)) {
        await updateDoc(athleteRef, {
          passes: [...passes, userId],
          updatedAt: serverTimestamp()
        });
        console.log('Added pass to athlete:', { athleteId, userId });
      }
    }

    return true;
  } catch (error) {
    console.error('Error handling athlete action:', error);
    throw error;
  }
};

// Example usage:
/*
const newAthlete = {
  name: "John Smith",
  college: "University of California",
  sport: "Basketball",
  amountRequested: 5000,
  profilePhotoUrl: "https://example.com/photo.jpg"
};

try {
  const athleteId = await addAthleteProfile(newAthlete);
  console.log("New athlete profile created with ID:", athleteId);
} catch (error) {
  console.error("Failed to create athlete profile:", error);
}

const submitOffer = async () => {
  try {
    const athleteId = "athlete123"; // This would be the actual athlete ID
    const offerData = {
      companyName: "Nike",
      offerAmount: 10000
    };

    const offerId = await submitSponsorshipOffer(athleteId, offerData);
    console.log("Offer submitted successfully with ID:", offerId);
  } catch (error) {
    console.error("Failed to submit offer:", error);
  }
};

const fetchAthletes = async () => {
  try {
    const athletes = await getAllAthletes();
    console.log("Athletes:", athletes);
    
    // Example of how to use the data
    athletes.forEach(athlete => {
      console.log(`${athlete.name} from ${athlete.college} plays ${athlete.sport}`);
      console.log(`Requested amount: $${athlete.amountRequested}`);
    });
  } catch (error) {
    console.error("Failed to fetch athletes:", error);
  }
};
*/ 