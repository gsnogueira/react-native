import { AnyAction } from 'redux';

export type FinanceState = {
  user: null | {
    id: string;
    name: string;
    email: string;
  };
  transactions: Array<{
    id: string;
    userId: string;
    title: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    notes?: string;
    receiptUrl?: string;
    createdAt: number;
  }>;
  loading: boolean;
};

const initialState: FinanceState = {
  user: null,
  transactions: [],
  loading: false,
};

const rootReducer = (state = initialState, action: AnyAction): FinanceState => {
  switch (action.type) {
    case 'finance/setUser':
      return { ...state, user: action.payload };
    case 'finance/setTransactions':
      return { ...state, transactions: action.payload };
    case 'finance/setLoading':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export default rootReducer;
