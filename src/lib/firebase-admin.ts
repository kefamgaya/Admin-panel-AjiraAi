import * as admin from 'firebase-admin';

// Function to initialize Firebase Admin
function initializeFirebaseAdmin(): boolean {
  // Check if already initialized
  if (admin.apps.length > 0) {
    return true;
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Check which credentials are missing
    const missing: string[] = [];
    if (!projectId) missing.push('FIREBASE_PROJECT_ID');
    if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');
    if (!privateKey) missing.push('FIREBASE_PRIVATE_KEY');

    if (missing.length > 0) {
      const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
      if (!isBuildPhase) {
        console.warn(`Firebase Admin not initialized. Missing environment variables: ${missing.join(', ')}`);
      }
      return false;
    }

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });

    console.log('Firebase Admin initialized successfully');
    return true;
  } catch (error: any) {
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
    if (!isBuildPhase) {
      console.error('Firebase Admin initialization error:', error?.message || error);
    }
    return false;
  }
}

// Try to initialize on module load
initializeFirebaseAdmin();

// Export function to check/initialize Firebase Admin
export function ensureFirebaseAdmin(): boolean {
  if (admin.apps.length > 0) {
    return true;
  }
  return initializeFirebaseAdmin();
}

export const firebaseAdmin = admin;

