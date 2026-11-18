import { financeReducer, initialFinanceState } from './financeReducer';
import { AuthUser, Transaction } from '../types/finance';

describe('financeReducer', () => {
  it('clears the previous account transactions when the authenticated user changes', () => {
    const user: AuthUser = { id: 'user-1', name: 'Ana', email: 'ana@example.com' };
    const transaction: Transaction = {
      id: 'transaction-1',
      userId: user.id,
      title: 'Salário',
      amount: 100,
      type: 'income',
      category: 'Salário',
      date: '2026-11-15',
      createdAt: 1,
    };
    const authenticatedState = financeReducer(initialFinanceState, {
      type: 'auth/changed',
      user,
    });
    const loadedState = financeReducer(authenticatedState, {
      type: 'transactions/loaded',
      transactions: [transaction],
    });

    expect(
      financeReducer(loadedState, {
        type: 'auth/changed',
        user: { id: 'user-2', name: 'Bia', email: 'bia@example.com' },
      }),
    ).toEqual({
      user: { id: 'user-2', name: 'Bia', email: 'bia@example.com' },
      transactions: [],
      loading: true,
      error: null,
    });
  });
});
