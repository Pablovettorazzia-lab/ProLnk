import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDocFromServer,
  type Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

const typedConfig = firebaseConfig as typeof firebaseConfig & {
  firestoreDatabaseId?: string;
};

const databaseId =
  typedConfig.firestoreDatabaseId && typedConfig.firestoreDatabaseId !== '(default)'
    ? typedConfig.firestoreDatabaseId
    : 'ai-studio-prolnk-7f61c618-991f-462c-85f1-08c01a0eaf6d';

let dbInstance: Firestore;
try {
  // Force HTTP long-polling to prevent 10-second WebChannel hangs in proxied/iframe environments
  dbInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true
    },
    databaseId
  );
} catch {
  dbInstance = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
}

export const db = dbInstance;

// Test connection on boot per Firebase skill guidelines
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

testConnection();

export default app;
