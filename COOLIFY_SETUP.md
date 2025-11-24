# Coolify Environment Variables Setup Guide

## Quick Setup

1. **Go to your Coolify application**
   - Navigate to your application in Coolify dashboard
   - Click on "Environment Variables" or "Environment" tab

2. **Add Required Variables**
   - Copy variables from `coolify.env.template`
   - Paste them into Coolify's environment variables section
   - Replace all placeholder values with your actual credentials

3. **Restart Application**
   - After adding variables, restart your application
   - Check logs to ensure no errors

## Required Variables (Minimum)

These are the **absolute minimum** required for the app to work:

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Firebase Client (Required for Admin Registration)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Where to Get Credentials

### Supabase
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: Settings > API
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

### Firebase Client SDK
1. Go to: https://console.firebase.google.com/
2. Select your project
3. Go to: Project Settings (gear icon) > General tab
4. Scroll to "Your apps" section
5. If you don't have a web app, click "Add app" > Web
6. Copy the config values:
   ```javascript
   apiKey → NEXT_PUBLIC_FIREBASE_API_KEY
   authDomain → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   projectId → NEXT_PUBLIC_FIREBASE_PROJECT_ID
   storageBucket → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   messagingSenderId → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   appId → NEXT_PUBLIC_FIREBASE_APP_ID
   ```

### Firebase Admin SDK
1. Go to: https://console.firebase.google.com/
2. Select your project
3. Go to: Project Settings > Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Extract:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (see formatting below)

### Firebase Private Key Formatting for Coolify

The private key from the JSON file looks like:
```json
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

For Coolify, you need to:
1. Keep the entire key as one string
2. Keep the `\n` characters (don't replace with actual newlines)
3. Wrap it in quotes: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`

**Example:**
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

## Troubleshooting

### "Invalid API key" Error
- Check that `NEXT_PUBLIC_FIREBASE_API_KEY` is set correctly
- Verify the key matches your Firebase project
- Make sure there are no extra spaces or quotes
- Restart the application after adding variables

### "Firebase config is incomplete" Warning
- Ensure ALL `NEXT_PUBLIC_FIREBASE_*` variables are set
- Check for typos in variable names
- Verify values are correct

### Registration Not Working
- Verify Firebase Client SDK variables are set
- Check browser console for specific errors
- Ensure Firebase Authentication is enabled in Firebase Console
- Check that Email/Password auth method is enabled

## Testing

After setting up variables:
1. Restart your Coolify application
2. Try accessing `/admin/login`
3. Try registering a new admin at `/admin/register`
4. Check application logs in Coolify for any errors

## Security Notes

- Never commit actual credentials to git
- Use Coolify's environment variables feature (not files)
- Rotate keys regularly
- Use different keys for development and production

