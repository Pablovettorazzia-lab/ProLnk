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

// Google Chat OAuth scopes provisioned for this applet
export const GOOGLE_CHAT_SCOPES = [
  'https://www.googleapis.com/auth/chat.admin.delete',
  'https://www.googleapis.com/auth/chat.admin.memberships',
  'https://www.googleapis.com/auth/chat.admin.memberships.readonly',
  'https://www.googleapis.com/auth/chat.admin.spaces',
  'https://www.googleapis.com/auth/chat.admin.spaces.readonly',
  'https://www.googleapis.com/auth/chat.customemojis',
  'https://www.googleapis.com/auth/chat.customemojis.readonly',
  'https://www.googleapis.com/auth/chat.delete',
  'https://www.googleapis.com/auth/chat.memberships',
  'https://www.googleapis.com/auth/chat.memberships.app',
  'https://www.googleapis.com/auth/chat.memberships.readonly',
  'https://www.googleapis.com/auth/chat.messages',
  'https://www.googleapis.com/auth/chat.messages.create',
  'https://www.googleapis.com/auth/chat.messages.reactions',
  'https://www.googleapis.com/auth/chat.messages.reactions.create',
  'https://www.googleapis.com/auth/chat.messages.reactions.readonly',
  'https://www.googleapis.com/auth/chat.messages.readonly',
  'https://www.googleapis.com/auth/chat.spaces',
  'https://www.googleapis.com/auth/chat.spaces.create',
  'https://www.googleapis.com/auth/chat.spaces.readonly',
  'https://www.googleapis.com/auth/chat.users.readstate',
  'https://www.googleapis.com/auth/chat.users.readstate.readonly',
  'https://www.googleapis.com/auth/chat.users.sections',
  'https://www.googleapis.com/auth/chat.users.sections.readonly',
  'https://www.googleapis.com/auth/chat.users.spacesettings'
];

// Google Classroom OAuth scopes provisioned for this applet
export const GOOGLE_CLASSROOM_SCOPES = [
  'https://www.googleapis.com/auth/classroom.addons.student',
  'https://www.googleapis.com/auth/classroom.addons.teacher',
  'https://www.googleapis.com/auth/classroom.announcements',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/classroom.courses',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
  'https://www.googleapis.com/auth/classroom.guardianlinks.me.readonly',
  'https://www.googleapis.com/auth/classroom.guardianlinks.students',
  'https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly',
  'https://www.googleapis.com/auth/classroom.profile.emails',
  'https://www.googleapis.com/auth/classroom.profile.photos',
  'https://www.googleapis.com/auth/classroom.push-notifications',
  'https://www.googleapis.com/auth/classroom.rosters',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
  'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
  'https://www.googleapis.com/auth/classroom.topics',
  'https://www.googleapis.com/auth/classroom.topics.readonly'
];

export const GOOGLE_WORKSPACE_SCOPES = [
  ...GOOGLE_CHAT_SCOPES,
  ...GOOGLE_CLASSROOM_SCOPES
];

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

const googleWorkspaceProvider = new GoogleAuthProvider();
googleWorkspaceProvider.setCustomParameters({
  prompt: 'consent select_account'
});
GOOGLE_WORKSPACE_SCOPES.forEach(scope => {
  googleWorkspaceProvider.addScope(scope);
});

// In-memory cache ONLY (never stored in localStorage/sessionStorage)
let cachedWorkspaceAccessToken: string | null = null;
let isWorkspaceSigningIn = false;

export const initGoogleWorkspaceAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: FirebaseUser | null) => {
    if (user) {
      if (cachedWorkspaceAccessToken) {
        onAuthSuccess?.(user, cachedWorkspaceAccessToken);
      } else if (!isWorkspaceSigningIn) {
        cachedWorkspaceAccessToken = null;
        onAuthFailure?.();
      }
    } else {
      cachedWorkspaceAccessToken = null;
      onAuthFailure?.();
    }
  });
};

export const googleWorkspaceSignIn = async (): Promise<{
  user: FirebaseUser;
  accessToken: string;
}> => {
  try {
    isWorkspaceSigningIn = true;
    const result = await signInWithPopup(auth, googleWorkspaceProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google Workspace desde Firebase Auth.');
    }
    cachedWorkspaceAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedWorkspaceAccessToken };
  } finally {
    isWorkspaceSigningIn = false;
  }
};

export const getWorkspaceAccessToken = (): string | null => {
  return cachedWorkspaceAccessToken;
};

export const clearWorkspaceAccessToken = (): void => {
  cachedWorkspaceAccessToken = null;
};

// Aliases kept for existing GoogleChatPanel imports
export const initGoogleChatAuth = initGoogleWorkspaceAuth;
export const googleChatSignIn = googleWorkspaceSignIn;
export const getChatAccessToken = getWorkspaceAccessToken;
export const clearChatAccessToken = clearWorkspaceAccessToken;

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

export const registerUserWithEmail = async (
  name: string,
  email: string,
  pass: string
): Promise<FirebaseUser> => {
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
  cachedWorkspaceAccessToken = null;
  await signOut(auth);
};

export const onAuthStatusChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
