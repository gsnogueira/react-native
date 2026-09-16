export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface TransactionInput {
  title: string;
  amount: string;
  type: TransactionType;
  category: string;
  date: string;
  notes: string;
  receiptUri?: string;
}