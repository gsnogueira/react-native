import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { financeRepository } from '../data/financeRepository';
import { firebaseAuthRepository, isFirebaseEnabled } from '../data/firebaseAuthRepository';
import { AuthRepository, FinanceRepository } from '../domain/repositories';
import { buildTransactionFromInput, createTransactionId } from '../domain/finance';
import { AuthUser, Transaction, TransactionInput } from '../types/finance';
import { financeReducer, initialFinanceState } from './financeReducer';

type FinanceValue = {
  user: AuthUser | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  isFirebaseEnabled: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  saveTransaction: (input: TransactionInput, id?: string) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
};

const Context = createContext<FinanceValue | undefined>(undefined);

type FinanceProviderProps = {
  children: React.ReactNode;
  authRepository?: AuthRepository;
  transactionsRepository?: FinanceRepository;
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Ocorreu um erro ao carregar seus dados.';

export const FinanceProvider: React.FC<FinanceProviderProps> = ({
  children,
  authRepository = firebaseAuthRepository,
  transactionsRepository = financeRepository,
}) => {
  const [state, dispatchState] = useReducer(financeReducer, initialFinanceState);
  const stateRef = useRef(state);
  const authRequestId = useRef(0);
  const transactionMutationQueue = useRef<Promise<void>>(Promise.resolve());

  const dispatch = useCallback((action: Parameters<typeof financeReducer>[1]) => {
    stateRef.current = financeReducer(stateRef.current, action);
    dispatchState(action);
  }, []);

  const refreshTransactions = useCallback(async () => {
    const user = stateRef.current.user;
    if (!user) {
      throw new Error('Faça login para carregar suas transações.');
    }

    const requestId = ++authRequestId.current;
    dispatch({ type: 'loading/started' });
    try {
      const transactions = await transactionsRepository.readTransactions(user.id);
      if (requestId === authRequestId.current && stateRef.current.user?.id === user.id) {
        dispatch({ type: 'transactions/loaded', transactions });
      }
    } catch (error) {
      if (requestId === authRequestId.current && stateRef.current.user?.id === user.id) {
        dispatch({ type: 'loading/failed', error: errorMessage(error) });
      }
      throw error;
    }
  }, [dispatch, transactionsRepository]);

  useEffect(() => {
    const unsubscribe = authRepository.subscribe(user => {
      const requestId = ++authRequestId.current;
      dispatch({ type: 'auth/changed', user });
      if (!user) {
        return;
      }

      transactionsRepository.readTransactions(user.id).then(
        transactions => {
          if (requestId === authRequestId.current && stateRef.current.user?.id === user.id) {
            dispatch({ type: 'transactions/loaded', transactions });
          }
        },
        error => {
          if (requestId === authRequestId.current && stateRef.current.user?.id === user.id) {
            dispatch({ type: 'loading/failed', error: errorMessage(error) });
          }
        },
      );
    });

    return () => {
      authRequestId.current += 1;
      unsubscribe();
    };
  }, [authRepository, dispatch, transactionsRepository]);

  const signIn = useCallback(
    (email: string, password: string) => authRepository.signIn(email, password),
    [authRepository],
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const user = await authRepository.signUp(name, email, password);
      dispatch({ type: 'auth/userUpdated', user });
    },
    [authRepository, dispatch],
  );

  const logout = useCallback(async () => {
    const userId = stateRef.current.user?.id;
    await authRepository.logout();
    if (userId) {
      transactionsRepository.clearCache(userId);
    }
  }, [authRepository, transactionsRepository]);

  const enqueueTransactionMutation = useCallback((mutation: () => Promise<void>) => {
    const task = transactionMutationQueue.current.then(mutation);
    transactionMutationQueue.current = task.catch(() => undefined);
    return task;
  }, []);

  const saveTransaction = useCallback(
    (input: TransactionInput, transactionId?: string) => {
      const expectedUserId = stateRef.current.user?.id;
      if (!expectedUserId) {
        return Promise.reject(new Error('Faça login para salvar uma transação.'));
      }

      return enqueueTransactionMutation(async () => {
        const currentState = stateRef.current;
        const user = currentState.user;
        if (!user || user.id !== expectedUserId) {
          throw new Error('A conta mudou antes de salvar a transação. Tente novamente.');
        }

        const nextTransaction = buildTransactionFromInput(
          input,
          user.id,
          transactionId || createTransactionId(),
        );
        const transactions = transactionId
          ? currentState.transactions.map(item =>
              item.id === transactionId ? nextTransaction : item,
            )
          : [nextTransaction, ...currentState.transactions];

        await transactionsRepository.saveTransactions(user.id, transactions);
        if (stateRef.current.user?.id === user.id) {
          dispatch({ type: 'transactions/saved', transactions });
        }
      });
    },
    [dispatch, enqueueTransactionMutation, transactionsRepository],
  );

  const removeTransaction = useCallback(
    (transactionId: string) => {
      const expectedUserId = stateRef.current.user?.id;
      if (!expectedUserId) {
        return Promise.reject(new Error('Faça login para remover uma transação.'));
      }

      return enqueueTransactionMutation(async () => {
        const { user, transactions } = stateRef.current;
        if (!user || user.id !== expectedUserId) {
          throw new Error('A conta mudou antes de remover a transação. Tente novamente.');
        }

        const nextTransactions = transactions.filter(item => item.id !== transactionId);
        await transactionsRepository.saveTransactions(user.id, nextTransactions);
        if (stateRef.current.user?.id === user.id) {
          dispatch({ type: 'transactions/saved', transactions: nextTransactions });
        }
      });
    },
    [dispatch, enqueueTransactionMutation, transactionsRepository],
  );

  const value = useMemo(
    () => ({
      ...state,
      isFirebaseEnabled,
      signIn,
      signUp,
      logout,
      saveTransaction,
      removeTransaction,
      refreshTransactions,
    }),
    [
      state,
      signIn,
      signUp,
      logout,
      saveTransaction,
      removeTransaction,
      refreshTransactions,
    ],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useFinance = () => {
  const value = useContext(Context);
  if (!value) {
    throw new Error('useFinance deve ser usado dentro de FinanceProvider.');
  }
  return value;
};
