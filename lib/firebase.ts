/**
 * lib/firebase.ts
 *
 * Firebase initialization for LogicBite.
 * Supports Firebase Auth (Google Sign-In) and Firestore for
 * storing user profiles, scan history, and behavior analytics.
 *
 * Environment variables must be set in .env.local:
 *   NEXT_PUBLIC_FIREBASE_API_KEY
 *   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 *   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
 *   NEXT_PUBLIC_FIREBASE_APP_ID
 */

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  type Auth,
} from "firebase/auth";
import {
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import {
  getStorage,
  type FirebaseStorage,
} from "firebase/storage";

// ─── Firebase Config ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

// ─── Singleton App ────────────────────────────────────────────────────────────
/** Firebase app instance — only initialized once (SSR safe). */
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ─── Service Exports ──────────────────────────────────────────────────────────
/** Firebase Authentication instance */
export const auth: Auth = getAuth(app);

/** Firestore database instance */
export const db: Firestore = getFirestore(app);

/** Firebase Storage instance */
export const storage: FirebaseStorage = getStorage(app);

/** Google OAuth provider (pre-configured for LogicBite scopes) */
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");

export default app;
