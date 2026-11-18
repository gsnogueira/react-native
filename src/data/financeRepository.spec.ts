import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { readTransactions, saveTransactions } from './financeRepository';
import { Transaction } from '../types/finance';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

jest.mock('react-native-encrypted-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

const userTransaction = (userId: string, id: string): Transaction => ({
  id,
  userId,
  title: 'Mercado',
  amount: 25,
  type: 'expense',
  category: 'Alimentação',
  date: '2026-11-15',
  createdAt: 1,
});

describe('financeRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('stores transactions in encrypted storage under their account key', async () => {
    const transaction = userTransaction('storage-user-1', 'storage-transaction-1');

    await saveTransactions(transaction.userId, [transaction]);

    expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
      '@finance/transactions/storage-user-1',
      JSON.stringify([transaction]),
    );
  });

  it('rejects transaction data stored under another account', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (EncryptedStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify([userTransaction('storage-user-2', 'storage-transaction-2')]),
    );

    await expect(readTransactions('storage-user-3')).rejects.toThrow(
      'Foram encontrados dados associados a outra conta.',
    );
  });

  it('migrates legacy plaintext transactions into account-scoped encrypted storage', async () => {
    const first = userTransaction('storage-migration-user-1', 'storage-migration-1');
    const second = userTransaction('storage-migration-user-2', 'storage-migration-2');
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([first, second]));
    (EncryptedStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(JSON.stringify([first]));

    await expect(readTransactions(first.userId)).resolves.toEqual([first]);

    expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
      '@finance/transactions/storage-migration-user-1',
      JSON.stringify([first]),
    );
    expect(EncryptedStorage.setItem).toHaveBeenCalledWith(
      '@finance/transactions/storage-migration-user-2',
      JSON.stringify([second]),
    );
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@finance/transactions');
  });
});
