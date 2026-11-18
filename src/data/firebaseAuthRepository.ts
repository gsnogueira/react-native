import EncryptedStorage from 'react-native-encrypted-storage';
import { getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { AuthRepository } from '../domain/repositories';
import { createAuthUser } from '../domain/finance';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseEnabled = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

const unavailableMessage =
  'Configure FIREBASE_API_KEY, FIREBASE_PROJECT_ID e FIREBASE_APP_ID antes de iniciar o Metro.';

const createFirebaseAuthRepository = (): AuthRepository => {
  const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const firebaseAuth = (() => {
    try {
      return initializeAuth(firebaseApp, {
        persistence: getReactNativePersistence(EncryptedStorage),
      });
    } catch (error) {
      const isAlreadyInitialized =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'auth/already-initialized';

      if (!isAlreadyInitialized) {
        throw error;
      }

      return getAuth(firebaseApp);
    }
  })();

  return {
    subscribe: listener =>
      onAuthStateChanged(firebaseAuth, currentUser => {
        listener(
          currentUser
            ? createAuthUser(currentUser.uid, currentUser.displayName, currentUser.email)
            : null,
        );
      }),

    signIn: async (email, password) => {
      await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    },

    signUp: async (name, email, password) => {
      const credential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password,
      );
      await updateProfile(credential.user, { displayName: name.trim() });
      return createAuthUser(
        credential.user.uid,
        credential.user.displayName,
        credential.user.email,
      );
    },

    logout: async () => {
      await signOut(firebaseAuth);
    },
  };
};

const unavailableAuthRepository: AuthRepository = {
  subscribe: listener => {
    listener(null);
    return () => {};
  },
  signIn: async () => {
    throw new Error(unavailableMessage);
  },
  signUp: async () => {
    throw new Error(unavailableMessage);
  },
  logout: async () => {},
};

export const firebaseAuthRepository = isFirebaseEnabled
  ? createFirebaseAuthRepository()
  : unavailableAuthRepository;
