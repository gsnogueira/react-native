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
import { firebaseConfig } from '../config/firebase';
import { AuthRepository } from '../domain/repositories';
import { createAuthUser } from '../domain/finance';
import { AuthUser } from '../types/finance';

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

const toAuthUser = (user: {
  uid: string;
  displayName: string | null;
  email: string | null;
}): AuthUser => createAuthUser(user.uid, user.displayName, user.email);

export const firebaseAuthRepository: AuthRepository = {
  subscribe: listener =>
    onAuthStateChanged(firebaseAuth, currentUser => {
      listener(currentUser ? toAuthUser(currentUser) : null);
    }),

  signIn: async (email, password) => {
    await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
  },

  signUp: async (name, email, password) => {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
    await updateProfile(credential.user, { displayName: name.trim() });
    return toAuthUser(credential.user);
  },

  logout: async () => {
    await signOut(firebaseAuth);
  },
};

export const isFirebaseEnabled = Object.values(firebaseConfig).every(Boolean);
