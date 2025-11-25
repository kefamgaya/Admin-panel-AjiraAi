/**
 * FCM Notification Test Script
 * Tests Firebase Cloud Messaging notification sending
 * 
 * Usage: node test-fcm-notification.js <registration_token>
 * 
 * Make sure to set these environment variables:
 * - FIREBASE_ADMIN_PROJECT_ID or FIREBASE_PROJECT_ID
 * - FIREBASE_ADMIN_CLIENT_EMAIL or FIREBASE_CLIENT_EMAIL
 * - FIREBASE_ADMIN_PRIVATE_KEY or FIREBASE_PRIVATE_KEY
 */

// Try to load dotenv if available, otherwise use environment variables directly
try {
  require('dotenv').config({ path: './.env.local' });
} catch (e) {
  // dotenv not available, will use environment variables directly
}

const admin = require('firebase-admin');

// Get environment variables (support both naming conventions)
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;

// Get registration token from command line
const registrationToken = process.argv[2];

async function testFCMNotification() {
  console.log('🧪 Testing FCM Notification Sending\n');
  console.log('============================================================\n');

  // Check environment variables
  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ Missing Firebase Admin credentials!');
    console.error('\nRequired environment variables:');
    if (!projectId) console.error('  - FIREBASE_ADMIN_PROJECT_ID or FIREBASE_PROJECT_ID');
    if (!clientEmail) console.error('  - FIREBASE_ADMIN_CLIENT_EMAIL or FIREBASE_CLIENT_EMAIL');
    if (!privateKey) console.error('  - FIREBASE_ADMIN_PRIVATE_KEY or FIREBASE_PRIVATE_KEY');
    console.error('\nPlease set these in your .env.local file or environment.');
    process.exit(1);
  }

  if (!registrationToken) {
    console.error('❌ Missing registration token!');
    console.error('\nUsage: node test-fcm-notification.js <registration_token>');
    console.error('\nTo get a registration token:');
    console.error('  1. Open your web app');
    console.error('  2. Check the browser console for FCM registration token');
    console.error('  3. Copy the token and use it as an argument');
    process.exit(1);
  }

  console.log('✅ Environment variables found');
  console.log(`   Project ID: ${projectId}`);
  console.log(`   Client Email: ${clientEmail}`);
  console.log(`   Private Key: ${privateKey.substring(0, 50)}...`);
  console.log(`   Registration Token: ${registrationToken.substring(0, 50)}...\n`);

  try {
    // Initialize Firebase Admin
    console.log('🔧 Initializing Firebase Admin SDK...');
    
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log('✅ Firebase Admin initialized successfully\n');
    } else {
      console.log('✅ Firebase Admin already initialized\n');
    }

    // Build FCM message following FCM best practices
    // Reference: https://firebase.google.com/docs/cloud-messaging/send-message
    console.log('📨 Building FCM message...');
    
    const message = {
      notification: {
        title: 'Test Notification',
        body: 'This is a test notification from FCM! 🚀',
      },
      data: {
        click_action: 'https://ajiraai.africa',
        sent_at: new Date().toISOString(),
        test: 'true',
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default',
          priority: 'high',
        },
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: 'Test Notification',
              body: 'This is a test notification from FCM! 🚀',
            },
            sound: 'default',
            badge: 1,
          },
        },
      },
      webpush: {
        notification: {
          title: 'Test Notification',
          body: 'This is a test notification from FCM! 🚀',
          icon: '/icon-192x192.png',
        },
      },
      token: registrationToken,
    };

    console.log('✅ Message built successfully\n');

    // Send the message
    console.log('📤 Sending notification...');
    console.log('   Target: Single device');
    console.log('   Token: ' + registrationToken.substring(0, 50) + '...\n');

    const response = await admin.messaging().send(message);

    console.log('============================================================');
    console.log('✅ SUCCESS! Notification sent successfully!');
    console.log('============================================================\n');
    console.log('📊 Response:');
    console.log(`   Message ID: ${response}\n`);
    console.log('💡 Next steps:');
    console.log('   1. Check the target device for the notification');
    console.log('   2. If notification appears, FCM is working correctly');
    console.log('   3. If not, check:');
    console.log('      - Device has internet connection');
    console.log('      - App has notification permissions');
    console.log('      - Registration token is valid and not expired');
    console.log('      - Service worker is registered (for web)\n');

  } catch (error) {
    console.error('============================================================');
    console.error('❌ ERROR: Failed to send notification');
    console.error('============================================================\n');
    console.error('Error details:');
    console.error(`   Code: ${error.code || 'Unknown'}`);
    console.error(`   Message: ${error.message || error}\n`);

    // Provide helpful error messages
    if (error.code === 'messaging/invalid-registration-token' || error.code === 'messaging/invalid-argument') {
      console.error('💡 This error means:');
      console.error('   - The registration token is invalid or expired');
      console.error('   - The token may have been unregistered');
      console.error('   - The token format is incorrect');
      console.error('   - Solution: Get a new registration token from the client app');
      console.error('   - For testing, use a real FCM token from your web/mobile app\n');
    } else if (error.code === 'messaging/registration-token-not-registered') {
      console.error('💡 This error means:');
      console.error('   - The registration token is no longer valid');
      console.error('   - The app may have been uninstalled');
      console.error('   - Solution: Get a new registration token\n');
    } else if (error.code === 'messaging/invalid-argument') {
      console.error('💡 This error means:');
      console.error('   - The message payload is invalid');
      console.error('   - Check the message structure');
      console.error('   - Solution: Review FCM message format\n');
    } else {
      console.error('💡 Troubleshooting:');
      console.error('   1. Check Firebase Admin credentials are correct');
      console.error('   2. Verify the registration token is valid');
      console.error('   3. Check Firebase project settings');
      console.error('   4. Review FCM API documentation\n');
    }

    process.exit(1);
  }
}

// Run the test
testFCMNotification()
  .then(() => {
    console.log('✅ Test completed successfully\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });

