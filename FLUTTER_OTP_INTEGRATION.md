# Fast2 — Flutter Phone OTP Integration Guide

## Overview

Phone authentication uses **Firebase Auth** on the client side. The app sends the OTP, the user verifies it, and then sends the Firebase `idToken` to the Fast2 backend which returns a JWT for all subsequent API calls.

```
Flutter → Firebase (send OTP) → User enters OTP
       → Firebase (verify OTP) → get idToken
       → Fast2 Backend (POST /api/user/firebase-otp-login) → get JWT token
```

---

## Firebase Project Details

| Field | Value |
|-------|-------|
| Project ID | `fast2user` |
| Android App | add your `google-services.json` from this project |
| iOS App | add your `GoogleService-Info.plist` from this project |

Download the config files from:  
**Firebase Console → fast2user project → Project Settings → Your apps**

---

## 1. Flutter Setup

### pubspec.yaml

```yaml
dependencies:
  firebase_core: ^3.x.x
  firebase_auth: ^5.x.x
  http: ^1.x.x
```

Run `flutter pub get`.

### Android — android/app/build.gradle

```gradle
android {
    defaultConfig {
        minSdkVersion 21
    }
}
```

Place `google-services.json` in `android/app/`.

### iOS

Place `GoogleService-Info.plist` in `ios/Runner/`.

Enable **Push Notifications** and **Background Modes → Remote notifications** in Xcode capabilities (required for silent APNs used by Firebase phone auth).

---

## 2. Initialize Firebase

```dart
// main.dart
import 'package:firebase_core/firebase_core.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  runApp(MyApp());
}
```

---

## 3. Phone OTP Flow

### Step 1 — Send OTP

```dart
import 'package:firebase_auth/firebase_auth.dart';

final FirebaseAuth _auth = FirebaseAuth.instance;
ConfirmationResult? _confirmationResult; // web only — not used in Flutter

// For Flutter mobile (Android/iOS):
String? _verificationId;

Future<void> sendOtp(String phoneNumber) async {
  // phoneNumber must include country code, e.g. "+916397046651"

  await _auth.verifyPhoneNumber(
    phoneNumber: phoneNumber,
    timeout: const Duration(seconds: 60),

    // Android only: auto-reads the OTP from SMS
    verificationCompleted: (PhoneAuthCredential credential) async {
      await _signInWithCredential(credential);
    },

    verificationFailed: (FirebaseAuthException e) {
      // Handle errors
      print('OTP send failed: ${e.code} — ${e.message}');
    },

    codeSent: (String verificationId, int? resendToken) {
      _verificationId = verificationId;
      // Navigate to OTP entry screen
    },

    codeAutoRetrievalTimeout: (String verificationId) {
      _verificationId = verificationId;
    },
  );
}
```

Phone number format: always include country code — `+91` prefix for Indian numbers.

```dart
// Helper: formats "9876543210" → "+919876543210"
String formatIndianPhone(String phone) {
  final digits = phone.replaceAll(RegExp(r'\D'), '');
  if (digits.startsWith('91') && digits.length == 12) return '+$digits';
  return '+91$digits';
}
```

### Step 2 — Verify OTP and get idToken

```dart
Future<String?> verifyOtpAndGetToken(String otp) async {
  if (_verificationId == null) return null;

  final credential = PhoneAuthProvider.credential(
    verificationId: _verificationId!,
    smsCode: otp,
  );

  return await _signInWithCredential(credential);
}

Future<String?> _signInWithCredential(PhoneAuthCredential credential) async {
  try {
    final userCredential = await _auth.signInWithCredential(credential);
    final idToken = await userCredential.user?.getIdToken();
    return idToken;
  } on FirebaseAuthException catch (e) {
    print('OTP verification failed: ${e.code} — ${e.message}');
    return null;
  }
}
```

### Step 3 — Send idToken to Fast2 Backend

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

const String _baseUrl = 'https://api.fast2.in';

Future<Map<String, dynamic>?> loginWithFirebaseToken({
  required String idToken,
  String? name,
  String? referralCode,
  String? fcmToken,
}) async {
  final response = await http.post(
    Uri.parse('$_baseUrl/api/user/firebase-otp-login'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'idToken': idToken,
      if (name != null && name.isNotEmpty) 'name': name,
      if (referralCode != null && referralCode.isNotEmpty) 'referralCode': referralCode,
      if (fcmToken != null) 'fcmToken': fcmToken,
    }),
  );

  if (response.statusCode == 200 || response.statusCode == 201) {
    return jsonDecode(response.body);
  } else {
    final error = jsonDecode(response.body);
    print('Backend login error: ${error['error']}');
    return null;
  }
}
```

### Full Flow — Putting it together

```dart
Future<void> handleOtpVerified(String otp) async {
  // 1. Verify OTP with Firebase
  final idToken = await verifyOtpAndGetToken(otp);
  if (idToken == null) {
    // show error to user
    return;
  }

  // 2. Get FCM token (optional but recommended for push notifications)
  // final fcmToken = await FirebaseMessaging.instance.getToken();

  // 3. Send to Fast2 backend
  final data = await loginWithFirebaseToken(
    idToken: idToken,
    name: nameController.text.trim(),       // optional
    referralCode: referralController.text.trim(), // optional
    // fcmToken: fcmToken,
  );

  if (data != null) {
    final jwtToken = data['token'];   // save this for API calls
    final user = data['user'];        // user object

    // Save token to secure storage
    // await secureStorage.write(key: 'token', value: jwtToken);

    // Navigate to home
  }
}
```

---

## 4. Backend Response

### Success (200 — existing user / 201 — new user)

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "user": {
    "_id": "...",
    "name": "User",
    "phone": "9876543210",
    "email": null,
    "wallet": 20,
    "referralCode": "ABC123",
    "isVerified": true
  }
}
```

New users automatically receive **₹20 wallet bonus**. If a valid `referralCode` was provided, the referrer gets **₹200 bonus**.

### Error (400 / 401 / 500)

```json
{
  "error": "Firebase token must contain a verified phone number or email"
}
```

---

## 5. Using the JWT Token for API Calls

After login, include the JWT in every request:

```dart
Future<http.Response> apiGet(String path, String jwtToken) {
  return http.get(
    Uri.parse('$_baseUrl$path'),
    headers: {
      'Authorization': 'Bearer $jwtToken',
      'Content-Type': 'application/json',
    },
  );
}
```

---

## 6. Error Reference

| Firebase Error Code | Meaning | Fix |
|---------------------|---------|-----|
| `auth/invalid-phone-number` | Bad phone format | Use `+91XXXXXXXXXX` format |
| `auth/too-many-requests` | Rate limited | Wait and retry |
| `auth/invalid-verification-code` | Wrong OTP | Ask user to re-enter |
| `auth/session-expired` | OTP expired (>60s) | Call `sendOtp` again |
| `auth/quota-exceeded` | SMS quota hit | Check Firebase Console |

---

## 7. Test Phone Numbers

During development, use these test numbers to avoid sending real SMS. These are configured in the Firebase Console and bypass reCAPTCHA/SMS entirely.

Set up in: **Firebase Console → fast2user → Authentication → Sign-in methods → Phone → Phone numbers for testing**

Ask the backend team to add test numbers before Flutter testing begins.
