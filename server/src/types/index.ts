export type Category =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'bills'
  | 'entertainment'
  | 'healthcare'
  | 'education'
  | 'salary'
  | 'investment'
  | 'other';

export type TransactionType = 'income' | 'expense';

export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  theme: 'light' | 'dark';
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: Category;
  type: TransactionType;
  date: string;
  notes?: string;
  tags?: string;
  isRecurring: boolean;
  recurringInterval?: string;
  currency: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: Category;
  limit: number;
  spent: number;
  month: number;
  year: number;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: Category;
  color: string;
  createdAt: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
