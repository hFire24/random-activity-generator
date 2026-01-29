// Authentication Service
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import firebaseConfig from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let unsubscribeSnapshot = null;

// Auth functions
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function signup(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Initialize user data
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      activities: [],
      categories: ['None'],
      wipes: [],
      theme: 'dark',
      createdAt: new Date().toISOString()
    });
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Check if this is a new user and initialize their data
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Initialize user data for new Google users
      await setDoc(userDocRef, {
        activities: [],
        categories: ['None'],
        wipes: [],
        theme: 'dark',
        createdAt: new Date().toISOString()
      });
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Sign-in cancelled' };
    }
    return { success: false, error: error.message };
  }
}

export async function logout() {
  try {
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
      unsubscribeSnapshot = null;
    }
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteAccount() {
  const user = getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    // First, delete user data from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {});
    
    // Then delete the authentication account
    await user.delete();
    
    // Clean up
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
      unsubscribeSnapshot = null;
    }
    
    // Clear local storage
    localStorage.clear();
    
    return { success: true };
  } catch (error) {
    if (error.code === 'auth/requires-recent-login') {
      return { success: false, error: 'For security, please log out and log back in before deleting your account.', requiresReauth: true };
    }
    return { success: false, error: error.message };
  }
}

export function getCurrentUser() {
  return auth.currentUser;
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Sync functions
export async function syncToCloud(data) {
  const user = getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    await setDoc(doc(db, 'users', user.uid), data, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Sync error:', error);
    return { success: false, error: error.message };
  }
}

export async function getFromCloud() {
  const user = getCurrentUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  try {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      // Initialize if doesn't exist
      const defaultData = {
        activities: [],
        categories: ['None'],
        wipes: [],
        theme: 'dark'
      };
      await setDoc(docRef, defaultData);
      return { success: true, data: defaultData };
    }
  } catch (error) {
    console.error('Get data error:', error);
    return { success: false, error: error.message };
  }
}

export function listenToCloudChanges(callback) {
  const user = getCurrentUser();
  if (!user) return null;

  const docRef = doc(db, 'users', user.uid);
  unsubscribeSnapshot = onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  }, (error) => {
    console.error('Snapshot error:', error);
  });

  return unsubscribeSnapshot;
}

// Export auth instance for direct access if needed
export { auth, db };
