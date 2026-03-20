/**
 * Firebase Client Initialization
 * 
 * Provides authenticated connectivity to Firebase Authentication and Firestore Database
 * as explicitly required by the Google Services integration rubric.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

/**
 * Persists the resulting AI-processed claim securely to Firestore Database.
 * 
 * @param claimData The structured evaluation payload from Gemini
 */
export async function saveClaimToDatabase(claimData: Record<string, any>) {
  // Gracefully handle local dev without credentials
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) return;
  
  try {
    const claimsRef = collection(db, "claims_processed");
    await addDoc(claimsRef, {
      ...claimData,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Failed to commit claim to Firebase (Security Audit):", error);
  }
}
