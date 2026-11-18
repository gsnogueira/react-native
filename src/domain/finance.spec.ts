import { buildTransactionFromInput, createAuthUser, summarizeTransactions } from './finance';

describe('finance domain logic', () => {
  it('creates an auth user using email local-part as fallback name', () => {
    expect(createAuthUser('user-1', null, 'ana@example.com')).toEqual({
      id: 'user-1',
      name: 'ana',
      email: 'ana@example.com',
    });
  });

  it('normalizes transaction input for persistence', () => {
    const input = {
      title: '  Salário  ',
      amount: '1250,50',
      type: 'income' as const,
      category: 'Salário',
      date: '2026-11-15',
      notes: '  útil ',
      receiptUri: 'uri-1',
    };

    expect(buildTransactionFromInput(input, 'user-1', 'txn-1')).toEqual({
      id: 'txn-1',
      userId: 'user-1',
      title: 'Salário',
      amount: 1250.5,
      type: 'income',
      category: 'Salário',
      date: '2026-11-15',
      notes: 'útil',
      receiptUrl: 'uri-1',
      createdAt: expect.any(Number),
    });
  });

  it('calculates income, expenses, balance, and count in one summary', () => {
    const transactions = [
      { id: 'income', userId: 'user-1', title: 'Salário', amount: 1500, type: 'income' as const, category: 'Salário', date: '2026-11-15', createdAt: 1 },
      { id: 'expense', userId: 'user-1', title: 'Aluguel', amount: 700, type: 'expense' as const, category: 'Casa', date: '2026-11-15', createdAt: 2 },
    ];

    expect(summarizeTransactions(transactions)).toEqual({
      income: 1500,
      expenses: 700,
      balance: 800,
      transactionCount: 2,
    });
  });
});
