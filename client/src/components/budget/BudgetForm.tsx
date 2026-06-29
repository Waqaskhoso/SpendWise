import React, { useState } from 'react';
import { Budget, Category } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { EXPENSE_CATEGORIES, getCategoryLabel } from '../../utils/categoryUtils';
import { getCurrentMonth, getCurrentYear } from '../../utils/dateUtils';

interface BudgetFormProps {
  initial?: Partial<Budget>;
  onSubmit: (data: Omit<Budget, 'id' | 'spent'>) => Promise<void>;
  onCancel: () => void;
}

const CATEGORY_OPTIONS = EXPENSE_CATEGORIES.map((c) => ({
  value: c,
  label: getCategoryLabel(c),
}));

export function BudgetForm({ initial, onSubmit, onCancel }: BudgetFormProps) {
  const [form, setForm] = useState({
    category: initial?.category || ('food' as Category),
    limit: initial?.limit?.toString() || '',
    month: initial?.month?.toString() || getCurrentMonth().toString(),
    year: initial?.year?.toString() || getCurrentYear().toString(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.limit || Number(form.limit) <= 0) e.limit = 'Budget limit must be positive';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        category: form.category,
        limit: Number(form.limit),
        month: Number(form.month),
        year: Number(form.year),
      });
    } finally {
      setLoading(false);
    }
  };

  const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' }),
  }));

  const YEAR_OPTIONS = [-1, 0, 1].map((offset) => {
    const y = getCurrentYear() + offset;
    return { value: String(y), label: String(y) };
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Category"
        options={CATEGORY_OPTIONS}
        value={form.category}
        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
      />
      <Input
        label="Budget Limit"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        value={form.limit}
        onChange={(e) => setForm((f) => ({ ...f, limit: e.target.value }))}
        error={errors.limit}
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Month"
          options={MONTH_OPTIONS}
          value={form.month}
          onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
        />
        <Select
          label="Year"
          options={YEAR_OPTIONS}
          value={form.year}
          onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {initial?.id ? 'Update Budget' : 'Set Budget'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
