import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const LEGACY_DEV_CONFIG = {
  NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyB0MzepD6RNf-WtldDGT3zIoI0gTtHBWDk',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'garagemap-11a27.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'garagemap-11a27',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'garagemap-11a27.firebasestorage.app',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '703376208590',
  NEXT_PUBLIC_FIREBASE_APP_ID: '1:703376208590:web:c7dd1201f6cb780604169f',
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: 'G-9J4EV60C6Z',
} as const;

function getEnv(name: keyof typeof LEGACY_DEV_CONFIG): string {
  const value = process.env[name];
  if (value) {
    return value;
  }

  const fallback = LEGACY_DEV_CONFIG[name];
  if (process.env.NODE_ENV !== 'production' && fallback) {
    // Keep local dev working even if .env.local is not configured yet.
    console.warn(`[firebase] Missing ${name}; using development fallback config.`);
    return fallback;
  }

  if (!fallback) {
    throw new Error(`Missing required env var: ${name}`);
  }
  throw new Error(`Missing required env var: ${name}`);
}

const firebaseConfig = {
  apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || LEGACY_DEV_CONFIG.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
