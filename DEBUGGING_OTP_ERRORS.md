# OTP and reCAPTCHA Error Debugging Guide

## Issues Fixed

### 1. reCAPTCHA Already Rendered Error ✅
**Error**: "reCAPTCHA has already been rendered in this element"

**Solution**: 
- Added proper cleanup of reCAPTCHA verifier when switching between auth methods
- Implemented `useEffect` cleanup on component unmount
- Improved `getRecaptchaVerifier()` to clear existing verifier before creating a new one
- Added error/expired callbacks to reset reCAPTCHA state

**Changes in login/page.jsx**:
- Added `useEffect` with cleanup function
- Updated `switchToPhone()`, `switchToLogin()`, `switchToRegister()` to call `resetRecaptcha()`
- Enhanced `resetRecaptcha()` with try-catch error handling
- Improved `getRecaptchaVerifier()` with container validation and callback handlers

---

## 2. Firebase Errors (Backend Issues) ⚠️

### Error: "auth/invalid-app-credential"
**This is a Backend Firebase Admin SDK error**

**Root Cause**: Backend Firebase initialization failed
- Admin SDK credentials are invalid or not configured
- Service account JSON file is missing or invalid
- Environment variables for Firebase Admin SDK are not set

**What Our Setup Does**:
- Frontend sends OTP using Firebase Web SDK
- Backend verifies the Firebase idToken using Admin SDK
- Backend needs valid Firebase Admin credentials

### How to Fix Backend Firebase Admin SDK:

1. **Verify Backend Service Account JSON**:
   - You mentioned: `fast2user-firebase-adminsdk-fbsvc-86004c7271.json`
   - This file must exist in your backend project directory
   - Check that it's not corrupted and contains valid JSON
   - Never commit this file to git (add to .gitignore)

2. **Backend .env Configuration**:
   Your backend needs one of these setups:

   **Option A: Direct JSON file path**
   ```
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/fast2user-firebase-adminsdk-fbsvc-86004c7271.json
   ```

   **Option B: Encode JSON as base64 in environment variable**
   ```
   FIREBASE_SERVICE_ACCOUNT_BASE64=eyJwcm9q...  # base64 encoded JSON
   ```

   **Option C: Individual Firebase Admin variables**
   ```
   FIREBASE_PROJECT_ID=fast2user
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@fast2user.iam.gserviceaccount.com
   ```

3. **Backend Initialization Code** (check your backend):
   ```javascript
   // Should look something like this:
   const admin = require('firebase-admin');
   
   const serviceAccount = require('./fast2user-firebase-adminsdk-fbsvc-86004c7271.json');
   // OR from environment
   // const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
   
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount),
     projectId: 'fast2user'
   });
   ```

4. **Verify Firebase Admin SDK is Installed**:
   ```bash
   npm list firebase-admin
   # Should show: firebase-admin@latest (or recent version)
   ```

5. **To Debug**:
   - Check backend logs for Firebase initialization errors
   - Verify the service account JSON file path is correct
   - Verify file permissions (readable by backend process)
   - Restart backend after fixing credentials
   - Check that the service account email matches Firebase Console

---

### Frontend Configuration (For Reference) ✅

Your `.env.local` is already correctly configured:
```
NEXT_PUBLIC_API_URL=http://localhost:5000

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA7XfTEhvJ4pPDeSqlxxmZEbDhdi8M8pWE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fast2user.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fast2user
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fast2user.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=249275652563
NEXT_PUBLIC_FIREBASE_APP_ID=1:249275652563:web:b953b44dfa763f59f43726
```

---

## Testing the Fix

### Test reCAPTCHA Fix:
1. Go to login page with phone OTP
2. Switch between "Phone OTP" and "Email" tabs multiple times
3. Should NOT see "reCAPTCHA has already been rendered" error
4. reCAPTCHA should reset properly each time

### Test OTP Sending:
1. Go to phone OTP tab
2. Enter a valid Indian phone number
3. Click "Send OTP"
4. If you see "invalid variables env" error:
   - Check Firebase configuration in `.env.local`
   - Verify all `NEXT_PUBLIC_FIREBASE_*` values match Firebase Console
   - Restart frontend dev server after updating `.env.local`
   - Open console (F12) to see Firebase initialization errors

---

## Frontend Configuration Checklist

### .env.local - Verify All Values ✓

```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Firebase Web App Configuration (from Firebase Console → Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA...          # ← Web API Key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fast2user.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fast2user
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fast2user.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=249275652563
NEXT_PUBLIC_FIREBASE_APP_ID=1:249275652563:web:...
```

**What Each Does:**
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Allows frontend to authenticate with Firebase
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase domain for sign-in redirects
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase project identifier
- Others - Storage, messaging, and app identification

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "invalid variables env" | Check all `NEXT_PUBLIC_FIREBASE_*` values in `.env.local` match Firebase Console |
| reCAPTCHA already rendered | Use updated login/page.jsx (should be fixed) |
| Firebase initialization error | Verify API Key is correct - it should start with "AIza..." |
| OTP not sending | Check browser console for Firebase errors, verify .env.local, restart dev server |
| Wrong config when copying | Make sure you copy **Web app** config, NOT Admin SDK JSON |
