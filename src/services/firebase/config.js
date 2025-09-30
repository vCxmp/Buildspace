// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdCB67HAF-JW1fTkRef5E0hrcTiLJZ7RI",
  authDomain: "cseed-12ed9.firebaseapp.com",
  projectId: "cseed-12ed9",
  storageBucket: "cseed-12ed9.firebasestorage.app",
  messagingSenderId: "147828664674",
  appId: "1:147828664674:web:8c24715b3936fc5607643b",
  measurementId: "G-Z923TK27MV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with React Native persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage };

