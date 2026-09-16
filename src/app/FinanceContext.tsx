import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { AuthUser, Transaction, TransactionInput } from '../types/finance';

const TRANSACTIONS_KEY = '@finance/transactions';
const firebaseConfig = { apiKey: 'AIzaSyCsMfBDehzxj3qMTuZszebjdqYVHBz9hZk', authDomain: 'react-native-28557.firebaseapp.com', databaseURL: 'https://react-native-28557-default-rtdb.firebaseio.com', projectId: 'react-native-28557', storageBucket: 'react-native-28557.firebasestorage.app', messagingSenderId: '46403162733', appId: '1:46403162733:web:e5c0c265e852c1071e6564', measurementId: 'G-DD2D5F2401' };
const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);
const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const firebaseAuth = (() => { try { return initializeAuth(firebaseApp, { persistence: getReactNativePersistence(AsyncStorage) }); } catch { return getAuth(firebaseApp); } })();
type FinanceValue = { user: AuthUser | null; transactions: Transaction[]; loading: boolean; isFirebaseEnabled: boolean; signIn: (email: string, password: string) => Promise<void>; signUp: (name: string, email: string, password: string) => Promise<void>; logout: () => Promise<void>; saveTransaction: (input: TransactionInput, id?: string) => Promise<void>; removeTransaction: (id: string) => Promise<void>; refreshTransactions: () => Promise<void> };
const Context = createContext<FinanceValue | undefined>(undefined);
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const toAuthUser = (userId: string, name: string | null, email: string | null): AuthUser => ({ id: userId, name: name || email?.split('@')[0] || 'Usuário', email: email || '' });

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null); const [transactions, setTransactions] = useState<Transaction[]>([]); const [loading, setLoading] = useState(true);
  const refreshTransactions = async () => { const value = await AsyncStorage.getItem(TRANSACTIONS_KEY); setTransactions(value ? JSON.parse(value) : []); };
  useEffect(() => { refreshTransactions().catch(() => undefined); return onAuthStateChanged(firebaseAuth, currentUser => { setUser(currentUser ? toAuthUser(currentUser.uid, currentUser.displayName, currentUser.email) : null); setLoading(false); }); }, []);
  const signIn = async (email: string, password: string) => { await signInWithEmailAndPassword(firebaseAuth, email.trim(), password); };
  const signUp = async (name: string, email: string, password: string) => { const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password); await updateProfile(credential.user, { displayName: name.trim() }); setUser(toAuthUser(credential.user.uid, name.trim(), credential.user.email)); };
  const logout = async () => { await signOut(firebaseAuth); setUser(null); setTransactions([]); };
  const saveTransaction = async (input: TransactionInput, transactionId?: string) => { if (!user) throw new Error('Faça login para salvar uma transação.'); const transaction: Transaction = { id: transactionId || id(), userId: user.id, title: input.title.trim(), amount: Number(input.amount.replace(',', '.')), type: input.type, category: input.category, date: input.date, notes: input.notes.trim(), receiptUrl: input.receiptUri, createdAt: Date.now() }; const next = transactionId ? transactions.map(item => item.id === transactionId ? transaction : item) : [transaction, ...transactions]; await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(next)); setTransactions(next); };
  const removeTransaction = async (transactionId: string) => { const next = transactions.filter(item => item.id !== transactionId); await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(next)); setTransactions(next); };
  const value = useMemo(() => ({ user, transactions, loading, isFirebaseEnabled: isFirebaseConfigured, signIn, signUp, logout, saveTransaction, removeTransaction, refreshTransactions }), [user, transactions, loading]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
};
export const useFinance = () => { const value = useContext(Context); if (!value) throw new Error('useFinance deve ser usado dentro de FinanceProvider.'); return value; };