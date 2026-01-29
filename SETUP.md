# Cross-Device Syncing Setup Guide

This guide will help you set up secure cross-device syncing for your Random Activity Generator using Firebase.

## Overview

Your activity generator now supports:
- ✅ **Secure Authentication** - Only you can access your tasks
- ✅ **Cross-Device Syncing** - Changes sync between desktop and mobile
- ✅ **Real-time Updates** - See changes instantly across devices
- ✅ **Offline Mode** - Option to use without syncing

## Firebase Setup (Required for Syncing)

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Enter a project name (e.g., "random-activity-generator")
4. Disable Google Analytics (optional, not needed for this project)
5. Click **"Create project"**

### Step 2: Set Up Authentication

1. In your Firebase project, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Click on the **"Sign-in method"** tab

#### Enable Email/Password (Optional)
1. Click **"Email/Password"**
2. Toggle **"Enable"** to ON
3. Click **"Save"**

#### Enable Google Sign-In (Recommended)
1. Click **"Google"**
2. Toggle **"Enable"** to ON
3. Enter a **"Project support email"** (your email address)
4. Click **"Save"**

> **Note:** You can enable both methods or just Google. Google Sign-In is easier for users and more secure.

### Step 3: Create Firestore Database

1. In your Firebase project, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll add security rules next)
4. Select a location close to you (e.g., `us-central`)
5. Click **"Enable"**

### Step 4: Add Security Rules

1. In Firestore Database, click the **"Rules"** tab
2. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

### Step 5: Get Your Firebase Configuration

1. In your Firebase project overview, click the **gear icon** ⚙️ next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"**
4. If you don't see a web app, click the **Web icon** (`</>`) to create one
5. Register your app with a nickname (e.g., "Random Activity Generator Web")
6. Click **"Register app"** (you can skip "Add Firebase SDK" for now)
7. You'll see a `firebaseConfig` object - copy these values

### Step 6: Update Your Configuration File

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};
```

3. Save the file

## How to Use

### First Time Setup

**Option 1: Google Sign-In (Easiest)**
1. Open `login.html` in your browser
2. Click **"Sign in with Google"**
3. Choose your Google account
4. You'll be automatically logged in and redirected

**Option 2: Email/Password**
1. Open `login.html` in your browser
2. Click **"Sign up"** below the Google button
3. Create an account with your email and password (minimum 6 characters)
4. You'll be automatically logged in and redirected

### Using Across Devices

**With Google Sign-In:**
1. On your second device, open `login.html`
2. Click **"Sign in with Google"**
3. Your tasks will automatically sync!

**With Email/Password:**
1. On your second device, open `login.html`
2. Click the "or" section to use email/password
3. Login with the same email and password
4. Your tasks will automatically sync!

### Offline Mode

If you don't want to set up syncing right now:
- Click **"Continue without syncing (offline mode)"** on the login page
- Your data will stay local on that device only

## Features

### Real-time Syncing
- Add/edit/delete tasks on one device
- See changes appear instantly on other devices
- Categories and settings also sync

### Security
- Each user's data is completely private
- Firebase security rules ensure only you can access your data
- Password-protected accounts

### Offline Support
- Works even when offline
- Changes sync when you reconnect
- Choose to use without any account at all

## Troubleshooting

### "Permission denied" error
- Make sure you've set up the Firestore security rules correctly (Step 4)
- Verify you're logged in with a valid account

### "Firebase not configured" error
- Check that `firebase-config.js` has your actual Firebase configuration
- Make sure all values are filled in (not "YOUR_API_KEY_HERE")

### Google Sign-In popup blocked
- Allow popups for your site in browser settings
- Some browsers block popups by default
- Try clicking the button again after allowing popups

### "Configuration not found" for Google Sign-In
- Make sure you enabled Google authentication in Firebase Console (Step 2)
- Verify you entered a support email when enabling Google Sign-In
- Wait a few minutes for changes to propagate

### Changes not syncing
- Check your internet connection
- Make sure you're logged in on both devices
- Open browser console (F12) to see any error messages

### Can't log in
- Verify your email and password are correct
- Password must be at least 6 characters
- Check that Email/Password authentication is enabled in Firebase Console

## Privacy & Data

- Your data is stored in Firebase Firestore (Google Cloud)
- Only you can access your data (enforced by security rules)
- No one else can see your tasks or account information
- To completely delete your data, delete your account in the Firebase Console

## Cost

Firebase offers a generous free tier that's more than enough for personal use:
- **Free tier includes:**
  - 50,000 document reads/day
  - 20,000 document writes/day
  - 1 GB storage

For a single user syncing activities, you'll likely never exceed the free tier.

## Support

If you run into issues:
1. Check the browser console for error messages (Press F12)
2. Verify all Firebase setup steps are completed
3. Make sure `firebase-config.js` has your actual configuration values
