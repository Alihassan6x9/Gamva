import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database, ref, onValue, onDisconnect } from "firebase/database";
import { getAuth, signInAnonymously, onAuthStateChanged, type Auth, type User } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

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
let firestoreInstance: Firestore | null = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  dbInstance = getDatabase(app);
  authInstance = getAuth(app);
  // Firestore is used purely as the WebRTC signaling channel (offers,
  // answers, ICE candidates) for voice/video calls. Room/game state stays
  // on the Realtime Database — the original app's data store.
  firestoreInstance = getFirestore(app);
}

export const db = dbInstance as Database;
export const auth = authInstance as Auth;
export const firestore = firestoreInstance as Firestore;

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

// Registers Firebase's built-in presence detection so a player is
// reliably removed from a room if their connection drops — even after
// a phone locks/backgrounds or the network flaps and reconnects.
export function trackPresence(code: string, playerId: string) {
  if (!isFirebaseConfigured || !dbInstance) return;

  const connectedRef = ref(dbInstance, ".info/connected");
  const playerRef = ref(dbInstance, `rooms/${code}/players/${playerId}`);

  onValue(connectedRef, (snap) => {
    if (snap.val() === false) return;
    onDisconnect(playerRef).remove();
  });
}
