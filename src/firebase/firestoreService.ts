import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from './config';
import { ForumPost, DashboardSession } from '../types';
import { FORUM_POSTS, USER_PAST_SESSIONS } from '../data/mockData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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

export interface SavedSketchRecord {
  id: string;
  userId: string;
  title: string;
  dataUrl: string;
  timestamp: string;
  createdAt: string;
}

function clampString(val: string | undefined, maxLen: number): string | undefined {
  if (val === undefined) return undefined;
  return val.trim().slice(0, maxLen);
}

function sanitizeData<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = val;
    }
  }
  return clean;
}

function toIsoString(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return typeof value === 'string' ? value : new Date().toISOString();
}

// User Profile
export const saveUserProfile = async (profile: UserProfileData): Promise<void> => {
  if (!auth.currentUser || auth.currentUser.uid !== profile.id) {
    return;
  }

  const path = `users/${profile.id}`;
  const userRef = doc(db, 'users', profile.id);

  let exists = false;
  try {
    const snap = await getDoc(userRef);
    exists = snap.exists();
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }

  const boundedSubjects = Array.isArray(profile.targetSubjects)
    ? profile.targetSubjects
        .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
        .slice(0, 20)
        .map(s => s.trim().slice(0, 80))
    : undefined;

  const updatableFields = sanitizeData({
    name: clampString(profile.name, 100) || 'Student',
    photoURL: clampString(profile.photoURL, 500),
    plan: clampString(profile.plan, 60) || '3-Day Free Trial',
    bio: clampString(profile.bio, 500),
    university: clampString(profile.university, 150),
    major: clampString(profile.major, 150),
    semester: clampString(profile.semester, 60),
    targetSubjects: boundedSubjects,
    learningGoal: clampString(profile.learningGoal, 500),
    streakDays: typeof profile.streakDays === 'number' ? Math.max(0, Math.min(100000, profile.streakDays)) : undefined,
    xpPoints: typeof profile.xpPoints === 'number' ? Math.max(0, Math.min(10000000, profile.xpPoints)) : undefined,
    updatedAt: serverTimestamp()
  });

  if (!exists) {
    const createPayload = sanitizeData({
      ...updatableFields,
      id: profile.id,
      email: clampString(profile.email || auth.currentUser.email || '', 200) || 'student@prolnk.edu',
      role: 'student',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    try {
      await setDoc(userRef, createPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  } else {
    try {
      await updateDoc(userRef, updatableFields);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfileData | null> => {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    return null;
  }

  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        ...(data as UserProfileData),
        createdAt: toIsoString(data.createdAt)
      };
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
  return null;
};

// User Tutoring Sessions
export const saveUserSession = async (uid: string, session: DashboardSession): Promise<void> => {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    return;
  }

  const path = `users/${uid}/sessions/${session.id}`;
  const sessionRef = doc(db, 'users', uid, 'sessions', session.id);

  const cleanSession = sanitizeData({
    id: clampString(session.id, 128) || `session-${Date.now()}`,
    userId: uid,
    expertName: clampString(session.expertName, 100) || 'ProLnk Tutor',
    subject: clampString(session.subject, 100) || 'General Tutoring',
    topic: clampString(session.topic, 200) || 'Tutoring Session',
    date: clampString(session.date, 80) || 'Scheduled',
    day: clampString(session.day, 20),
    month: clampString(session.month, 20),
    time: clampString(session.time, 40),
    status: session.status,
    tutorNotes: clampString(session.tutorNotes, 1000),
    urgentUsed: session.urgentUsed,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  try {
    await setDoc(sessionRef, cleanSession);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
};

export const getUserSessions = async (uid: string): Promise<DashboardSession[]> => {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    return USER_PAST_SESSIONS;
  }

  const path = `users/${uid}/sessions`;
  try {
    const sessionsRef = collection(db, 'users', uid, 'sessions');
    const q = query(sessionsRef, where('userId', '==', uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => d.data() as DashboardSession);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
  return USER_PAST_SESSIONS;
};

// Community Forum Posts
export const getForumPosts = async (): Promise<ForumPost[]> => {
  const path = 'forum_posts';
  try {
    const postsRef = collection(db, 'forum_posts');
    const q = query(
      postsRef,
      where('createdAt', '>', Timestamp.fromMillis(0)),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => ({ ...d.data(), id: d.id } as ForumPost));
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
  return FORUM_POSTS;
};

export const createForumPost = async (post: ForumPost, uid: string): Promise<void> => {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    return;
  }

  const path = `forum_posts/${post.id}`;
  const postRef = doc(db, 'forum_posts', post.id);

  const cleanPost = sanitizeData({
    id: clampString(post.id, 128) || `post-${Date.now()}`,
    title: clampString(post.title, 300) || 'Homework Question',
    previewText: clampString(post.previewText, 2000) || 'Awaiting breakdown...',
    category: clampString(post.category, 60) || 'General',
    author: clampString(post.author, 100) || 'Student',
    authorId: uid,
    votes: 1,
    repliesCount: 0,
    hasExpertAnswer: false,
    timeAgo: clampString(post.timeAgo, 40) || 'Just now',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  try {
    await setDoc(postRef, cleanPost);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
};

export const updatePostVotes = async (postId: string, delta: 1 | -1): Promise<void> => {
  if (!auth.currentUser) {
    return;
  }

  const path = `forum_posts/${postId}`;
  const postRef = doc(db, 'forum_posts', postId);

  let currentVotes = 0;
  try {
    const snap = await getDoc(postRef);
    if (!snap.exists()) {
      // Seeded demo post exists only in client state until created in Firestore
      return;
    }
    const existingVotes = snap.data()?.votes;
    currentVotes = typeof existingVotes === 'number' ? existingVotes : 0;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }

  const nextVotes = delta > 0 ? currentVotes + 1 : Math.max(0, currentVotes - 1);
  if (nextVotes === currentVotes) return;

  try {
    await updateDoc(postRef, {
      votes: nextVotes,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
};

// Whiteboard Sketches
export const saveUserSketch = async (
  uid: string,
  sketch: { id: string; title: string; dataUrl: string; timestamp: string }
): Promise<void> => {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    return;
  }

  const path = `users/${uid}/sketches/${sketch.id}`;
  const sketchRef = doc(db, 'users', uid, 'sketches', sketch.id);

  const cleanSketch = sanitizeData({
    id: clampString(sketch.id, 128) || `sketch-${Date.now()}`,
    userId: uid,
    title: clampString(sketch.title, 150) || 'Untitled Sketch',
    dataUrl: clampString(sketch.dataUrl, 500000) || '',
    timestamp: clampString(sketch.timestamp, 60) || 'Just now',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  try {
    await setDoc(sketchRef, cleanSketch);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
};

export const getUserSketches = async (uid: string): Promise<SavedSketchRecord[]> => {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    return [];
  }

  const path = `users/${uid}/sketches`;
  try {
    const ref = collection(db, 'users', uid, 'sketches');
    const q = query(ref, where('userId', '==', uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map(d => {
        const data = d.data();
        return {
          ...(data as SavedSketchRecord),
          createdAt: toIsoString(data.createdAt)
        };
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
  return [];
};
