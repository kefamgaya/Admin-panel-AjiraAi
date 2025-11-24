import * as admin from 'firebase-admin';

// Check if Firebase Admin is already initialized
if (!admin.apps.length) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Only initialize if all required credentials are present
    if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
    } else {
      // In build time, env vars might not be available - that's okay
      // Don't log warnings during build phase
      const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
      if (!isBuildPhase) {
        console.warn('Firebase Admin credentials not fully configured. Some features may not work.');
      }
    }
  } catch (error: any) {
    // Silently fail during build time
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
    if (!isBuildPhase) {
    console.error('Firebase admin initialization error', error);
    }
  }
}

export const firebaseAdmin = admin;

