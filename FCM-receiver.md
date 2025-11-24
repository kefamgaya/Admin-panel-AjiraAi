# FCM Receiver Implementation Guide for Web

This guide explains how to implement Firebase Cloud Messaging (FCM) on your web application to receive push notifications sent from the admin panel.

## Prerequisites

- Firebase project with Cloud Messaging enabled
- Firebase Web SDK installed
- Service worker support in your browser
- HTTPS (required for service workers and FCM)

## Step 1: Install Firebase SDK

```bash
npm install firebase
# or
yarn add firebase
```

## Step 2: Initialize Firebase in Your App

Create a Firebase configuration file (e.g., `firebase-config.js`):

```javascript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
```

## Step 3: Request Notification Permission

```javascript
async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    } else {
      console.log('Notification permission denied');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}
```

## Step 4: Get FCM Registration Token

The FCM token is used to identify the device and must be sent to your backend to store in the database.

```javascript
async function getFCMToken() {
  try {
    // Request permission first
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      throw new Error('Notification permission not granted');
    }

    // Get the registration token
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY' // Get this from Firebase Console > Project Settings > Cloud Messaging
    });

    if (token) {
      console.log('FCM Registration Token:', token);
      
      // Send token to your backend to store in database
      await sendTokenToBackend(token);
      
      return token;
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// Send token to your backend API
async function sendTokenToBackend(token) {
  try {
    const response = await fetch('/api/user/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        uid: getCurrentUserId() // Your user ID
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save FCM token');
    }
    
    console.log('FCM token saved to backend');
  } catch (error) {
    console.error('Error sending token to backend:', error);
  }
}
```

## Step 5: Handle Foreground Messages

When your app is in the foreground, you need to handle incoming messages manually:

```javascript
// Handle messages when app is in foreground
onMessage(messaging, (payload) => {
  console.log('Message received in foreground:', payload);
  
  // Show notification manually
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icon-192x192.png',
    image: payload.notification?.image,
    badge: '/badge-72x72.png',
    tag: 'notification',
    requireInteraction: payload.data?.requireInteraction === 'true',
    data: payload.data
  };

  // Show browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(notificationTitle, notificationOptions);
    
    // Handle notification click
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      
      // Handle deep link if provided
      if (payload.data?.click_action) {
        window.open(payload.data.click_action, '_blank');
      }
      
      notification.close();
    };
  }
});
```

## Step 6: Create Service Worker for Background Messages

Create a service worker file (e.g., `firebase-messaging-sw.js`) in your `public` folder:

```javascript
// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Message received in background:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icon-192x192.png',
    image: payload.notification?.image,
    badge: '/badge-72x72.png',
    tag: 'notification',
    requireInteraction: payload.data?.requireInteraction === 'true',
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  // Handle deep link if provided
  if (event.notification.data?.click_action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.click_action)
    );
  } else {
    // Open app by default
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
```

## Step 7: Register Service Worker

In your main app file, register the service worker:

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered:', registration);
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
}
```

## Step 8: Handle Token Refresh

FCM tokens can expire or be refreshed. Listen for token refresh events:

```javascript
import { onTokenRefresh } from 'firebase/messaging';

// Listen for token refresh
onTokenRefresh(messaging, async () => {
  const newToken = await getToken(messaging, {
    vapidKey: 'YOUR_VAPID_KEY'
  });
  
  console.log('FCM token refreshed:', newToken);
  
  // Update token in backend
  await sendTokenToBackend(newToken);
});
```

## Step 9: Complete Implementation Example

Here's a complete React/Next.js example:

```typescript
// hooks/useFCM.ts
import { useEffect, useState } from 'react';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export function useFCM() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Request permission and get token
    async function setupFCM() {
      try {
        const permission = await Notification.requestPermission();
        setPermission(permission);

        if (permission === 'granted') {
          const messaging = getMessaging(app);
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!
          });

          if (token) {
            setToken(token);
            // Send token to backend
            await fetch('/api/user/fcm-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token, uid: getCurrentUserId() })
            });
          }
        }
      } catch (error) {
        console.error('FCM setup error:', error);
      }
    }

    setupFCM();

    // Handle foreground messages
    const messaging = getMessaging(app);
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message:', payload);
      
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'New Notification', {
          body: payload.notification?.body,
          icon: payload.notification?.icon || '/icon-192x192.png',
          image: payload.notification?.image,
          data: payload.data
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return { token, permission };
}
```

## Step 10: Backend API Endpoint

Create an API endpoint to receive and store FCM tokens:

```typescript
// app/api/user/fcm-token/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { token, uid } = await request.json();

  if (!token || !uid) {
    return NextResponse.json(
      { error: 'Token and UID are required' },
      { status: 400 }
    );
  }

  // Update user's FCM token in database
  const { error } = await supabase
    .from('all_users')
    .update({ token })
    .eq('uid', uid);

  if (error) {
    console.error('Error saving FCM token:', error);
    return NextResponse.json(
      { error: 'Failed to save token' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
```

## Best Practices

1. **Request Permission at the Right Time**: Don't request notification permission immediately on page load. Wait for user interaction or show a helpful message first.

2. **Handle Token Refresh**: FCM tokens can be refreshed. Always listen for token refresh events and update your backend.

3. **Clean Up Invalid Tokens**: When sending notifications fails with "invalid-registration-token" error, remove that token from your database.

4. **Test on HTTPS**: Service workers and FCM only work on HTTPS (or localhost for development).

5. **Handle Different Browsers**: Some browsers have different notification APIs. Test on Chrome, Firefox, Safari, and Edge.

6. **Show User-Friendly Messages**: When permission is denied, explain why notifications are useful and how to enable them later.

## Troubleshooting

- **Token is null**: Check that VAPID key is correct and notification permission is granted.
- **Service worker not registering**: Ensure the file is in the `public` folder and accessible at the root URL.
- **Notifications not showing**: Check browser console for errors and verify service worker is active.
- **Background messages not working**: Ensure service worker is properly registered and the `firebase-messaging-sw.js` file is correct.

## References

- [Firebase Cloud Messaging Web Documentation](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web Push Notifications](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

## Security Notes

- Never expose your Firebase service account key in client-side code
- Use environment variables for Firebase config
- Validate FCM tokens on the backend before storing
- Implement rate limiting on your token update endpoint

