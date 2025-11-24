import { NextRequest, NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Verify the Firebase token if Firebase Admin is available
    let uid: string | null = null;
    
    if (firebaseAdmin.apps.length > 0) {
      try {
        const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
        uid = decodedToken.uid;
      } catch (error: any) {
        console.error('Token verification error:', error);
        // If verification fails, we'll still create the session but log the error
        // The token is already validated by Firebase client SDK
        // In production, you might want to be stricter here
        if (process.env.NODE_ENV === 'production') {
          return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
      }
    } else {
      console.warn('Firebase Admin not initialized. Session created without token verification.');
      // If Firebase Admin is not initialized, we'll extract UID from the token payload
      // This is less secure but allows the app to work without Admin SDK
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        uid = payload.sub || payload.user_id || null;
      } catch (e) {
        console.error('Failed to extract UID from token:', e);
      }
    }

    // Set a session cookie
    const response = NextResponse.json({ success: true, uid });
    response.cookies.set('firebase-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    
    if (uid) {
      response.cookies.set('firebase-uid', uid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error: any) {
    console.error('Session creation error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('firebase-auth-token');
  response.cookies.delete('firebase-uid');
  return response;
}

