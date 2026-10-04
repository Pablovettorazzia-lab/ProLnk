import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from './config';
import { ForumPost, DashboardSession } from '../types';
import { FORUM_POSTS, USER_PAST_SESSIONS } from '../data/mockData';

export interface UserProfileData {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  plan: string;
  role: 'student' | 'tutor' | 'admin';
  createdAt: string;
  bio?: string;
  university?: string;
  major?: string;
  semester?: string;
  targetSubjects?: string[];
  learningGoal?: string;
  streakDays?: number;
  xpPoints?: number;
}

// Utility to remove any undefined keys so Firestore doesn't throw unsupported field value error
function sanitizeData<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean;
}

// User Profile
export const saveUserProfile = async (profile: UserProfileData): Promise<void> => {
  try {
    // Only attempt Firestore write if user is authenticated in Firebase and matches auth.currentUser.uid
    if (!auth.currentUser || auth.currentUser.uid !== profile.id) {
      return;
    }
    const userRef = doc(db, 'users', profile.id);
    const cleanProfile = sanitizeData(profile);
    await setDoc(userRef, cleanProfile, { merge: true });
  } catch (err) {
    console.warn('Note saving user profile to Firestore:', err);
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfileData | null> => {
  try {
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      return null;
    }
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
  } catch (err) {
    console.warn('Note fetching user profile:', err);
  }
  return null;
};

// User Tutoring Sessions
export const saveUserSession = async (uid: string, session: DashboardSession): Promise<void> => {
  try {
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      return;
    }
    const sessionRef = doc(db, 'users', uid, 'sessions', session.id);
    const cleanSession = sanitizeData({
      ...session,
      userId: uid,
      createdAt: new Date().toISOString()
    });
    await setDoc(sessionRef, cleanSession);
  } catch (err) {
    console.warn('Note saving session to Firestore:', err);
  }
};

export const getUserSessions = async (uid: string): Promise<DashboardSession[]> => {
  try {
    // If not signed in to Firebase with this uid, return default sessions without throwing error
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      return USER_PAST_SESSIONS;
    }
    const sessionsRef = collection(db, 'users', uid, 'sessions');
    const snap = await getDocs(sessionsRef);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as DashboardSession);
    }
  } catch (err) {
    console.warn('Note getting user sessions from Firestore:', err);
  }
  return USER_PAST_SESSIONS;
};

// Community Forum Posts
export const getForumPosts = async (): Promise<ForumPost[]> => {
  try {
    const postsRef = collection(db, 'forum_posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as ForumPost));
    }
  } catch (err) {
    console.warn('Note fetching forum posts from Firestore:', err);
  }
  return FORUM_POSTS;
};

export const createForumPost = async (post: ForumPost, uid: string): Promise<void> => {
  try {
    const postRef = doc(db, 'forum_posts', post.id);
    const cleanPost = sanitizeData({
      ...post,
      authorId: uid,
      createdAt: new Date().toISOString()
    });
    await setDoc(postRef, cleanPost);
  } catch (err) {
    console.warn('Note creating forum post in Firestore:', err);
  }
};

export const updatePostVotes = async (postId: string, votes: number): Promise<void> => {
  try {
    const postRef = doc(db, 'forum_posts', postId);
    await updateDoc(postRef, { votes });
  } catch (err) {
    console.warn('Note updating post votes in Firestore:', err);
  }
};

// Whiteboard Sketches
export interface SavedSketchRecord {
  id: string;
  userId: string;
  title: string;
  dataUrl: string;
  timestamp: string;
  createdAt: string;
}

export const saveUserSketch = async (uid: string, sketch: { id: string; title: string; dataUrl: string; timestamp: string }): Promise<void> => {
  try {
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      return;
    }
    const sketchRef = doc(db, 'users', uid, 'sketches', sketch.id);
    const cleanSketch = sanitizeData({
      ...sketch,
      userId: uid,
      createdAt: new Date().toISOString()
    });
    await setDoc(sketchRef, cleanSketch);
  } catch (err) {
    console.warn('Note saving sketch to Firestore:', err);
  }
};

export const getUserSketches = async (uid: string): Promise<SavedSketchRecord[]> => {
  try {
    if (!auth.currentUser || auth.currentUser.uid !== uid) {
      return [];
    }
    const ref = collection(db, 'users', uid, 'sketches');
    const snap = await getDocs(ref);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as SavedSketchRecord);
    }
  } catch (err) {
    console.warn('Note getting user sketches from Firestore:', err);
  }
  return [];
};
