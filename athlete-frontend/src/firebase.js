// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";

// Your web app's Firebase configuration
// Values fallback to your exact Firebase project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCw_ry8MGVabs-dLK-_c-ScgATyNwmjee0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "drona-mate-auth.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "drona-mate-auth",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "drona-mate-auth.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "958755718432",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:958755718432:web:678a1a4e26e2d8a62b8345",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-C2X2X1WVJM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Safely initialize analytics in browser environments where supported
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics optional fallback
  });
}

/**
 * Helper to sign in with Google via Firebase Popup and get ID token.
 */
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  return {
    user: result.user,
    idToken,
  };
};

/**
 * Helper to initialize an invisible RecaptchaVerifier on the specified container element.
 * Safely clears any existing instance on window to prevent duplicate container errors.
 */
export const setupInvisibleRecaptcha = (containerId = 'recaptcha-container') => {
  if (typeof window === 'undefined') return null;

  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {
      // Ignored if already cleared
    }
    window.recaptchaVerifier = null;
  }

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {
          // ignore
        }
        window.recaptchaVerifier = null;
      }
    },
  });

  return window.recaptchaVerifier;
};

/**
 * Helper to log out of Firebase.
 */
export const logOutFirebase = async () => {
  await signOut(auth);
};

export {
  app,
  auth,
  analytics,
  googleProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
};

export default app;
