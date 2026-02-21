// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCN-XlCq9_x1z1DUzdIbCrCAk5m1aa2gRQ",
  authDomain: "cftvk-edcff.firebaseapp.com",
  projectId: "cftvk-edcff",
  storageBucket: "cftvk-edcff.firebasestorage.app",
  messagingSenderId: "685906532982",
  appId: "1:685906532982:web:d54964b904484a081e1d57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);