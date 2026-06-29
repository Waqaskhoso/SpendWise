import React, { useState } from 'react';
import { Transaction, Category, TransactionType } from '../../types';
import { Input, Textarea } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { ALL_CATEGORIES, getCategoryLabel } from '../../utils/categoryUtils';
import { todayISO } from '../../utils/dateUtils';

interface TransactionFormProps {
  initial?: Partial<Transaction>;
  onSubmit: (data: Omit<Transaction, 'id'>) => Promise<void>;
  onCancel: () => void;
  currency: string;
}

const CATEGORY_OPTIONS = ALL_CATEGORIES.map((c) => ({
  value: c,
  label: getCategoryLabel(c),
}));

const TYPE_OPTIONS = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

export function TransactionForm({ initial, onSubmit, onCancel, currency }: TransactionFormProps) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    amount: initial?.amount?.toString() || '',
    category: initial?.category || ('food' as Category),
    type: initial?.type || ('expense' as TransactionType),
    date: initial?.date || todayISO(),
    notes: initial?.notes || '',
    tags: (initial?.tags || []).join(', '),
    isRecurring: initial?.isRecurring || false,
    recurringInterval: initial?.recurringInterval || 'monthly',
    currency: initial?.currency || currency,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      e.amount = 'Amount must be a positive number';
    if (!form.date) e.date = 'Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        amount: Number(form.amount),
        category: form.category,
        type: form.type,
        date: form.date,
        notes: form.notes.trim() || undefined,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        isRecurring: form.isRecurring,
        recurringInterval: form.isRecurring ? (form.recurringInterval as any) : undefined,
        currency: form.currency,
      });
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => set('type', 'expense')}
          className={`py-2 rounded-lg text-sm font-medium transition-colors ${
            form.type === 'expense'
              ? 'bg-red-600 text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-dark-700 dark:text-slate-300'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => set('type', 'income')}
          className={`py-2 rounded-lg text-sm font-medium transition-colors ${
            form.type === 'income'
              ? 'bg-green-600 text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-dark-700 dark:text-slate-300'
          }`}
        >
          Income
        </button>
      </div>

      <Input
        label="Title"
        placeholder="e.g. Grocery shopping"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        error={errors.title}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Amount"
          type="number"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(e) => set('amount', e.target.value)}
          error={errors.amount}
        />
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
          error={errors.date}
        />
      </div>

      <Select
        label="Category"
        options={CATEGORY_OPTIONS}
        value={form.category}
        onChange={(e) => set('category', e.target.value)}
      />

      <Textarea
        label="Notes (optional)"
        placeholder="Add any notes..."
        value={form.notes}
        onChange={(e) => set('notes', e.target.value)}
        rows={2}
      />

      <Input
        label="Tags (optional, comma-separated)"
        placeholder="food, weekly, essential"
        value={form.tags}
        onChange={(e) => set('tags', e.target.value)}
      />

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isRecurring}
          onChange={(e) => set('isRecurring', e.target.checked)}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm text-slate-700 dark:text-slate-300">Recurring transaction</span>
      </label>

      {form.isRecurring && (
        <Select
          label="Recurring interval"
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' },
          ]}
          value={form.recurringInterval}
          onChange={(e) => set('recurringInterval', e.target.value)}
        />
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {initial?.id ? 'Update Transaction' : 'Add Transaction'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
