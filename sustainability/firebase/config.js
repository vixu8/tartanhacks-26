// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: "sustainability-e6011",
  storageBucket: "sustainability-e6011.firebasestorage.app",
  messagingSenderId: "355407033623",
  appId: "1:355407033623:web:ed05312e12004caedb3352"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);