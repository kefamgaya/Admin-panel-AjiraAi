import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

if (typeof window !== "undefined") {
  // Initialize Firebase only on client side
  try {
    if (getApps().length === 0) {
      // Validate config before initializing
      if (
        firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.projectId
      ) {
        app = initializeApp(firebaseConfig);
      } else {
        console.warn("Firebase config is incomplete. Please check your environment variables.");
      }
    } else {
      app = getApps()[0];
    }
    
    if (app) {
      auth = getAuth(app);
    }
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

export { auth };
export default app;

