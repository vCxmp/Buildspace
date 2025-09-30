import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Sign up a new user with email and password
export const signUp = async (email, password, userType) => {
  try {
    // Create the Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a user document with userType and email
    await setDoc(doc(db, 'users', user.uid), {
      email,
      userType,
      createdAt: new Date().toISOString()
    });

    return user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Log in an existing user with email and password
export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Log out the current user
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Get user type from Firestore
export const getUserType = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return null;
    }
    return userDoc.data().userType;
  } catch (error) {
    console.error('Error getting user type:', error);
    throw error;
  }
}; 