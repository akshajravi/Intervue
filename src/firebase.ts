// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBXdU9VB0tepKUnC1Aw7ZvwTIUk46vuqag",
  authDomain: "cardio-c3721.firebaseapp.com",
  projectId: "cardio-c3721",
  storageBucket: "cardio-c3721.appspot.com",
  messagingSenderId: "707299761182",
  appId: "1:707299761182:web:799d3c2e76ec20c77d220f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();