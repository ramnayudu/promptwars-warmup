/**
 * @file Firebase Client Initialization
 * @description Provides authenticated connectivity to Firebase Authentication and Firestore Database.
 * Gracefully degrades when environment variables are not configured (local dev).
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, type Firestore } from 'firebase/firestore';

/** Firebase configuration sourced exclusively from environment variables */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Whether Firebase has been provided valid credentials */
const isConfigured: boolean = !!firebaseConfig.apiKey;

const app: FirebaseApp | null = isConfigured
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : null;

const auth: Auth | null = app ? getAuth(app) : null;
const db: Firestore | null = app ? getFirestore(app) : null;

export { app, auth, db };

/**
 * Persists the resulting AI-processed claim securely to Firestore Database.
 * Silently skips persistence when Firebase is not configured.
 *
 * @param claimData - The structured evaluation payload from Gemini
 */
export async function saveClaimToDatabase(claimData: Record<string, unknown>): Promise<void> {
  if (!isConfigured || !db) {
    console.warn('Firebase credentials missing. Skipping DB persistence.');
    return;
  }

  try {
    const claimsRef = collection(db, 'claims_processed');
    await addDoc(claimsRef, {
      ...claimData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Failed to commit claim to Firebase (Security Audit):', error);
  }
}
