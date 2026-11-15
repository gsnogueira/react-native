import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types/finance';

const TRANSACTIONS_KEY = '@finance/transactions';

export const readTransactions = async (): Promise<Transaction[]> => {
  const value = await AsyncStorage.getItem(TRANSACTIONS_KEY);
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as Transaction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveTransactions = async (transactions: Transaction[]): Promise<void> => {
  await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};
