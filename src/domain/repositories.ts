import { AuthUser, Transaction } from '../types/finance';

export interface AuthRepository {
  subscribe(listener: (user: AuthUser | null) => void): () => void;
  signIn(email: string, password: string): Promise<void>;
  signUp(name: string, email: string, password: string): Promise<AuthUser>;
  logout(): Promise<void>;
}

export interface FinanceRepository {
  readTransactions(userId: string): Promise<Transaction[]>;
  saveTransactions(userId: string, transactions: Transaction[]): Promise<void>;
  clearCache(userId: string): void;
}
