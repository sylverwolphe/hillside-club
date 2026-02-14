import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCa6tv-h3yGoFl7PE5JL_o0cqCKZGywu0I",
  authDomain: "hillside-club.firebaseapp.com",
  projectId: "hillside-club",
  storageBucket: "hillside-club.firebasestorage.app",
  messagingSenderId: "636382514861",
  appId: "1:636382514861:web:b9af2769e0e30f466f4024",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
