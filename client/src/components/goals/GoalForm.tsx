import React, { useState } from 'react';
import { Goal, Category } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { ALL_CATEGORIES, getCategoryLabel } from '../../utils/categoryUtils';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f97316',
  '#22c55e', '#14b8a6', '#3b82f6', '#eab308',
];

interface GoalFormProps {
  initial?: Partial<Goal>;
  onSubmit: (data: Omit<Goal, 'id'>) => Promise<void>;
  onCancel: () => void;
  currency: string;
}

const CATEGORY_OPTIONS = ALL_CATEGORIES.map((c) => ({
  value: c,
  label: getCategoryLabel(c),
}));

export function GoalForm({ initial, onSubmit, onCancel, currency }: GoalFormProps) {
  const [form, setForm] = useState({
    title: initial?.title || '',
    targetAmount: initial?.targetAmount?.toString() || '',
    currentAmount: initial?.currentAmount?.toString() || '0',
    deadline: initial?.deadline || '',
    category: initial?.category || ('other' as Category),
    color: initial?.color || COLORS[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.targetAmount || Number(form.targetAmount) <= 0)
      e.targetAmount = 'Target amount must be positive';
    if (!form.deadline) e.deadline = 'Deadline is required';
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
        targetAmount: Number(form.targetAmount),
        currentAmount: Number(form.currentAmount),
        deadline: form.deadline,
        category: form.category,
        color: form.color,
      });
    } finally {
      setLoading(false);
    }
  };

  const set = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Goal Title"
        placeholder="e.g. Emergency Fund, New Car..."
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        error={errors.title}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Target Amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={form.targetAmount}
          onChange={(e) => set('targetAmount', e.target.value)}
          error={errors.targetAmount}
        />
        <Input
          label="Current Amount"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={form.currentAmount}
          onChange={(e) => set('currentAmount', e.target.value)}
        />
      </div>
      <Input
        label="Deadline"
        type="date"
        value={form.deadline}
        onChange={(e) => set('deadline', e.target.value)}
        error={errors.deadline}
      />
      <Select
        label="Category"
        options={CATEGORY_OPTIONS}
        value={form.category}
        onChange={(e) => set('category', e.target.value)}
      />
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Color
        </label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set('color', c)}
              className={`h-8 w-8 rounded-full transition-transform ${
                form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {initial?.id ? 'Update Goal' : 'Create Goal'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
