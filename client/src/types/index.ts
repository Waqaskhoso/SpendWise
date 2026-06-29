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

export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: Category;
  type: TransactionType;
  date: string;
  notes?: string;
  tags?: string[];
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  currency: string;
}

export interface Budget {
  id: string;
  category: Category;
  limit: number;
  spent: number;
  month: number;
  year: number;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: Category;
  color: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  theme: 'light' | 'dark';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export interface CategoryData {
  category: Category;
  amount: number;
  count: number;
}

export interface TrendData {
  date: string;
  amount: number;
  type: TransactionType;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface TransactionFilters {
  search?: string;
  category?: Category | '';
  type?: TransactionType | '';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
