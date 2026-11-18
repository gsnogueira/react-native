import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Transaction } from '../types/finance';
import { FinanceRepository } from '../domain/repositories';

const TRANSACTIONS_KEY = '@finance/transactions';
const USER_TRANSACTIONS_KEY = '@finance/transactions/';

const isTransaction = (value: unknown): value is Transaction => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const transaction = value as Record<string, unknown>;
  return (
    typeof transaction.id === 'string' &&
    typeof transaction.userId === 'string' &&
    typeof transaction.title === 'string' &&
    typeof transaction.amount === 'number' &&
    Number.isFinite(transaction.amount) &&
    (transaction.type === 'income' || transaction.type === 'expense') &&
    typeof transaction.category === 'string' &&
    typeof transaction.date === 'string' &&
    typeof transaction.createdAt === 'number' &&
    (transaction.notes === undefined || typeof transaction.notes === 'string') &&
    (transaction.receiptUrl === undefined || typeof transaction.receiptUrl === 'string')
  );
};

const parseTransactions = (value: string): Transaction[] => {
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || !parsed.every(isTransaction)) {
    throw new Error('Os dados locais de transações estão em um formato inválido.');
  }

  return parsed;
};

const storageKey = (userId: string) => `${USER_TRANSACTIONS_KEY}${encodeURIComponent(userId)}`;
const cache = new Map<string, Transaction[]>();
const writeQueues = new Map<string, Promise<void>>();

const migrateLegacyTransactions = async (): Promise<void> => {
  const legacyValue = await AsyncStorage.getItem(TRANSACTIONS_KEY);
  if (legacyValue === null) {
    return;
  }

  const legacyTransactions = parseTransactions(legacyValue);
  const transactionsByUser = new Map<string, Transaction[]>();
  legacyTransactions.forEach(transaction => {
    const userTransactions = transactionsByUser.get(transaction.userId) || [];
    userTransactions.push(transaction);
    transactionsByUser.set(transaction.userId, userTransactions);
  });

  for (const [userId, legacyUserTransactions] of transactionsByUser) {
    const key = storageKey(userId);
    const storedValue = await EncryptedStorage.getItem(key);
    const storedTransactions = storedValue === null ? [] : parseTransactions(storedValue);
    if (storedTransactions.some(transaction => transaction.userId !== userId)) {
      throw new Error('Foram encontrados dados associados a outra conta.');
    }

    const storedIds = new Set(storedTransactions.map(transaction => transaction.id));
    const mergedTransactions = [
      ...storedTransactions,
      ...legacyUserTransactions.filter(transaction => !storedIds.has(transaction.id)),
    ];

    await EncryptedStorage.setItem(key, JSON.stringify(mergedTransactions));
    cache.set(userId, mergedTransactions);
  }

  await AsyncStorage.removeItem(TRANSACTIONS_KEY);
};

export const readTransactions = async (userId: string): Promise<Transaction[]> => {
  if (!userId) {
    throw new Error('É necessário identificar a conta para carregar transações.');
  }

  const cachedTransactions = cache.get(userId);
  if (cachedTransactions) {
    return [...cachedTransactions];
  }

  await migrateLegacyTransactions();
  const value = await EncryptedStorage.getItem(storageKey(userId));

  const transactions = value === null ? [] : parseTransactions(value);
  if (transactions.some(transaction => transaction.userId !== userId)) {
    throw new Error('Foram encontrados dados associados a outra conta.');
  }

  cache.set(userId, transactions);
  return [...transactions];
};

export const saveTransactions = async (
  userId: string,
  transactions: Transaction[],
): Promise<void> => {
  if (!userId || transactions.some(transaction => transaction.userId !== userId)) {
    throw new Error('Não é permitido salvar transações de outra conta.');
  }

  const key = storageKey(userId);
  const previousWrite = writeQueues.get(userId) || Promise.resolve();
  const write = previousWrite.then(
    () => EncryptedStorage.setItem(key, JSON.stringify(transactions)),
    () => EncryptedStorage.setItem(key, JSON.stringify(transactions)),
  );
  writeQueues.set(userId, write);

  try {
    await write;
    cache.set(userId, [...transactions]);
  } finally {
    if (writeQueues.get(userId) === write) {
      writeQueues.delete(userId);
    }
  }
};

export const clearTransactionCache = (userId: string): void => {
  cache.delete(userId);
};

export const financeRepository: FinanceRepository = {
  readTransactions,
  saveTransactions,
  clearCache: clearTransactionCache,
};
