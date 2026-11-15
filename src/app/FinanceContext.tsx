import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebase';
import { readTransactions, saveTransactions } from '../data/financeRepository';
import { buildTransactionFromInput, createAuthUser, createTransactionId } from '../domain/finance';
import { AuthUser, Transaction, TransactionInput } from '../types/finance';

const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const firebaseAuth = (() => {
  try {
    return initializeAuth(firebaseApp, { persistence: getReactNativePersistence(AsyncStorage) });
  } catch {
    return getAuth(firebaseApp);
  }
})();

type FinanceValue = {
  user: AuthUser | null;
  transactions: Transaction[];
  loading: boolean;
  isFirebaseEnabled: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  saveTransaction: (input: TransactionInput, id?: string) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
};

const Context = createContext<FinanceValue | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTransactions = async () => {
    const next = await readTransactions();
    setTransactions(next);
  };

  useEffect(() => {
    refreshTransactions().catch(() => undefined);

    return onAuthStateChanged(firebaseAuth, currentUser => {
      setUser(currentUser ? createAuthUser(currentUser.uid, currentUser.displayName, currentUser.email) : null);
      setLoading(false);
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
    await updateProfile(credential.user, { displayName: name.trim() });
    setUser(createAuthUser(credential.user.uid, name.trim(), credential.user.email));
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    setUser(null);
    setTransactions([]);
  };

  const saveTransaction = async (input: TransactionInput, transactionId?: string) => {
    if (!user) {
      throw new Error('Faça login para salvar uma transação.');
    }

    const nextTransaction = buildTransactionFromInput(
      input,
      user.id,
      transactionId || createTransactionId(),
    );

    const next = transactionId
      ? transactions.map(item => (item.id === transactionId ? nextTransaction : item))
      : [nextTransaction, ...transactions];

    await saveTransactions(next);
    setTransactions(next);
  };

  const removeTransaction = async (transactionId: string) => {
    const next = transactions.filter(item => item.id !== transactionId);
    await saveTransactions(next);
    setTransactions(next);
  };

  const value = useMemo(
    () => ({ user, transactions, loading, isFirebaseEnabled: isFirebaseConfigured, signIn, signUp, logout, saveTransaction, removeTransaction, refreshTransactions }),
    [user, transactions, loading],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useFinance = () => {
  const value = useContext(Context);
  if (!value) {
    throw new Error('useFinance deve ser usado dentro de FinanceProvider.');
  }
  return value;
};