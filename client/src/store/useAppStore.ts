import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Budget, Goal } from '../types';

interface AppState {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  currency: string;

  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;

  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrency: (currency: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      transactions: [],
      budgets: [],
      goals: [],
      theme: 'light',
      sidebarOpen: true,
      currency: 'USD',

      setTransactions: (transactions) => set({ transactions }),
      addTransaction: (transaction) =>
        set((state) => ({ transactions: [transaction, ...state.transactions] })),
      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      setBudgets: (budgets) => set({ budgets }),
      addBudget: (budget) =>
        set((state) => ({ budgets: [...state.budgets, budget] })),
      updateBudget: (id, updates) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        })),
      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),

      setGoals: (goals) => set({ goals }),
      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        })),
      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        })),

      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setCurrency: (currency) => set({ currency }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ theme: state.theme, currency: state.currency }),
    }
  )
);
