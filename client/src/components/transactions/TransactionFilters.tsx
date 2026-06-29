import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { TransactionFilters as Filters } from '../../types';
import { ALL_CATEGORIES, getCategoryLabel } from '../../utils/categoryUtils';

interface TransactionFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  ...ALL_CATEGORIES.map((c) => ({ value: c, label: getCategoryLabel(c) })),
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

export function TransactionFilters({ filters, onChange }: TransactionFiltersProps) {
  const hasFilters =
    filters.search || filters.category || filters.type || filters.startDate || filters.endDate;

  const clear = () =>
    onChange({ search: '', category: '', type: '', startDate: '', endDate: '' });

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 p-4 space-y-3">
      <Input
        placeholder="Search transactions..."
        value={filters.search || ''}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        leftIcon={<Search className="h-4 w-4" />}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Select
          options={CATEGORY_OPTIONS}
          value={filters.category || ''}
          onChange={(e) => onChange({ ...filters, category: e.target.value as any })}
        />
        <Select
          options={TYPE_OPTIONS}
          value={filters.type || ''}
          onChange={(e) => onChange({ ...filters, type: e.target.value as any })}
        />
        <Input
          type="date"
          placeholder="Start date"
          value={filters.startDate || ''}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
        />
        <Input
          type="date"
          placeholder="End date"
          value={filters.endDate || ''}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
        />
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clear} icon={<X className="h-4 w-4" />}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
