// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCh2w43Ijcc-Ee8wbHCT-03GYOkt_Cn2yo",
  authDomain: "sustainability-e6011.firebaseapp.com",
  projectId: "sustainability-e6011",
  storageBucket: "sustainability-e6011.firebasestorage.app",
  messagingSenderId: "355407033623",
  appId: "1:355407033623:web:ed05312e12004caedb3352"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);