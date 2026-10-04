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
import { auth } from './config';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

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
