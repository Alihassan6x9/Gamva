import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth, type User } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase config is provided via Replit environment variables. Until they're
// set, we skip initialization instead of crashing the whole app on load —
// the UI surfaces a friendly message when a Firebase call is attempted.
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.databaseURL && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let dbInstance: Database | null = null;
let authInstance: Auth | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  dbInstance = getDatabase(app);
  authInstance = getAuth(app);
}

export const db = dbInstance as Database;
export const auth = authInstance as Auth;

// Every visitor is signed in anonymously in the background so Firebase
// security rules can require auth without ever showing a login screen.
// Returns a promise that resolves once we have a signed-in user.
let readyPromise: Promise<User> | null = null;

export function ensureSignedIn(): Promise<User> {
  if (!isFirebaseConfigured || !authInstance) {
    return Promise.reject(
      new Error(
        "Firebase isn't configured yet. Add your Firebase project's web config to this app's environment variables."
      )
    );
  }

  if (readyPromise) return readyPromise;

  const authRef = authInstance;
  readyPromise = new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      authRef,
      (user) => {
        if (user) {
          unsubscribe();
          resolve(user);
        } else {
          signInAnonymously(authRef).catch(reject);
        }
      },
      reject
    );
  });

  return readyPromise;
}
