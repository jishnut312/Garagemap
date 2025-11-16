import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB0MzepD6RNf-WtldDGT3zIoI0gTtHBWDk",
  authDomain: "garagemap-11a27.firebaseapp.com",
  projectId: "garagemap-11a27",
  storageBucket: "garagemap-11a27.firebasestorage.app",
  messagingSenderId: "703376208590",
  appId: "1:703376208590:web:c7dd1201f6cb780604169f",
  measurementId: "G-9J4EV60C6Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
