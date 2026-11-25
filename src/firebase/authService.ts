import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const formatFirebaseAuthError = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please log in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed before completing authentication.';
      case 'auth/popup-blocked':
        return 'Pop-up was blocked by your browser. Please allow pop-ups and try again.';
      case 'auth/operation-not-allowed':
        return 'Email/password sign-in is not enabled in Firebase Console. Try Google sign-in or enable Email/Password in Firebase Authentication.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait a moment and try again.';
      case 'auth/network-request-failed':
        return 'Network error while contacting Firebase Auth. Check your connection and retry.';
      default:
        return error.message || 'Authentication failed. Please try again.';
    }
  }
  return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
};

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const registerUserWithEmail = async (name: string, email: string, pass: string): Promise<FirebaseUser> => {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (name) {
    await updateProfile(cred.user, { displayName: name });
  }
  return cred.user;
};

export const loginUserWithEmail = async (email: string, pass: string): Promise<FirebaseUser> => {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
};

export const logoutUser = async (): Promise<void> => {
  await signOut(auth);
};

export const onAuthStatusChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
