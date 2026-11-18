import { AuthUser, Transaction } from '../types/finance';

export type FinanceState = {
  user: AuthUser | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
};

export type FinanceAction =
  | { type: 'auth/changed'; user: AuthUser | null }
  | { type: 'auth/userUpdated'; user: AuthUser }
  | { type: 'transactions/loaded'; transactions: Transaction[] }
  | { type: 'transactions/saved'; transactions: Transaction[] }
  | { type: 'loading/started' }
  | { type: 'loading/failed'; error: string };

export const initialFinanceState: FinanceState = {
  user: null,
  transactions: [],
  loading: true,
  error: null,
};

export const financeReducer = (state: FinanceState, action: FinanceAction): FinanceState => {
  switch (action.type) {
    case 'auth/changed':
      return {
        user: action.user,
        transactions: [],
        loading: Boolean(action.user),
        error: null,
      };
    case 'auth/userUpdated':
      return { ...state, user: action.user };
    case 'transactions/loaded':
    case 'transactions/saved':
      return { ...state, transactions: action.transactions, loading: false, error: null };
    case 'loading/started':
      return { ...state, loading: true, error: null };
    case 'loading/failed':
      return { ...state, loading: false, error: action.error };
    default:
      return state;
  }
};
