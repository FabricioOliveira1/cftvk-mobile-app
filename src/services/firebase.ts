// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgACE3-XgVdhUUzPENo8C2crF9eAIvqX0",
  authDomain: "cftvk-edcff.firebaseapp.com",
  projectId: "cftvk-edcff",
  storageBucket: "cftvk-edcff.firebasestorage.app",
  messagingSenderId: "685906532982",
  appId: "1:685906532982:web:d54964b904484a081e1d57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});
export const functions = getFunctions(app);
export const storage = getStorage(app);

console.log('Firebase initialized');