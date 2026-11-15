import { AuthUser, Transaction, TransactionInput } from '../types/finance';

export const createTransactionId = (): string =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const createAuthUser = (
  userId: string,
  name: string | null,
  email: string | null,
): AuthUser => ({
  id: userId,
  name: name?.trim() || email?.split('@')[0]?.trim() || 'Usuário',
  email: email || '',
});

export const buildTransactionFromInput = (
  input: TransactionInput,
  userId: string,
  transactionId: string,
): Transaction => ({
  id: transactionId,
  userId,
  title: input.title.trim(),
  amount: Number(String(input.amount).replace(',', '.').trim()),
  type: input.type,
  category: input.category.trim(),
  date: input.date,
  notes: input.notes.trim(),
  receiptUrl: input.receiptUri,
  createdAt: Date.now(),
});
