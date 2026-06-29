import { Category } from '../types';

export const CATEGORY_LABELS: Record<Category, string> = {
  food: 'Food & Dining',
  transport: 'Transport',
  shopping: 'Shopping',
  bills: 'Bills & Utilities',
  entertainment: 'Entertainment',
  healthcare: 'Healthcare',
  education: 'Education',
  salary: 'Salary',
  investment: 'Investment',
  other: 'Other',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  food: '#f97316',
  transport: '#3b82f6',
  shopping: '#a855f7',
  bills: '#ef4444',
  entertainment: '#ec4899',
  healthcare: '#14b8a6',
  education: '#6366f1',
  salary: '#22c55e',
  investment: '#eab308',
  other: '#94a3b8',
};

export const EXPENSE_CATEGORIES: Category[] = [
  'food',
  'transport',
  'shopping',
  'bills',
  'entertainment',
  'healthcare',
  'education',
  'other',
];

export const INCOME_CATEGORIES: Category[] = ['salary', 'investment', 'other'];

export const ALL_CATEGORIES: Category[] = [
  'food',
  'transport',
  'shopping',
  'bills',
  'entertainment',
  'healthcare',
  'education',
  'salary',
  'investment',
  'other',
];

export function getCategoryLabel(category: Category): string {
  return CATEGORY_LABELS[category] || category;
}

export function getCategoryColor(category: Category): string {
  return CATEGORY_COLORS[category] || '#94a3b8';
}

export const CURRENCIES = [
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'JPY', label: 'Japanese Yen (¥)' },
  { code: 'CAD', label: 'Canadian Dollar (C$)' },
  { code: 'AUD', label: 'Australian Dollar (A$)' },
  { code: 'CHF', label: 'Swiss Franc (Fr)' },
  { code: 'INR', label: 'Indian Rupee (₹)' },
  { code: 'PKR', label: 'Pakistani Rupee (₨)' },
  { code: 'SEK', label: 'Swedish Krona (kr)' },
];
