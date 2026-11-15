import { buildTransactionFromInput, createAuthUser } from './finance';

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
});
