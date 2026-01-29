# 🔐 Cross-Device Syncing - Quick Start

Your Random Activity Generator now has **secure cross-device syncing**! 

## ⚡ Quick Start

### Option 1: Use With Syncing (Recommended)
1. Follow the setup guide in [SETUP.md](SETUP.md) to configure Firebase
2. Open [login.html](login.html) and create an account
3. Log in on any device to sync your tasks

### Option 2: Use Offline (No Setup Required)
1. Open [login.html](login.html)
2. Click "Continue without syncing (offline mode)"
3. Your data stays local on this device only

## 🎯 What Changed

### New Features
- 🔒 **Secure Authentication** - Email/password login
- 🔄 **Real-time Syncing** - Changes appear instantly across devices
- 📱 **Mobile Support** - Works on desktop and mobile
- 🌐 **Offline Mode** - Optional - works without syncing

### New Files
- `auth.js` - Handles Firebase authentication
- `sync.js` - Syncs data between localStorage and Firebase
- `firebase-config.js` - Your Firebase configuration (YOU NEED TO EDIT THIS)
- `login.html` - Login/signup page
- `SETUP.md` - Complete setup instructions

### Modified Files
- `manage.js` - Now uses sync service instead of direct localStorage
- `manage.html` - Added logout button and module script support
- `script.js` - Updated to use sync service

## 🚀 To Get Started

1. **Edit `firebase-config.js`** with your Firebase credentials (see [SETUP.md](SETUP.md))
2. Open `login.html` in your browser
3. Create an account or use offline mode

## 📖 Full Setup Instructions

See [SETUP.md](SETUP.md) for complete Firebase setup instructions.

## 🔒 Privacy

- Your data is **completely private** - only you can access it
- Firebase security rules ensure no one else can read your tasks
- Works with any modern browser
- No tracking or analytics

## 💡 How It Works

- Tasks are stored in **Firebase Firestore** (cloud database)
- **Real-time listeners** keep your devices in sync
- Falls back to **localStorage** when offline
- Optional **offline mode** if you don't want cloud sync

Enjoy syncing your activities across all your devices! 🎉
