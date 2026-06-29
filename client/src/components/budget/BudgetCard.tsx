import React from 'react';
import { Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Budget } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { getCategoryLabel, getCategoryColor } from '../../utils/categoryUtils';
import clsx from 'clsx';

interface BudgetCardProps {
  budget: Budget;
  currency: string;
  onEdit: (b: Budget) => void;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget, currency, onEdit, onDelete }: BudgetCardProps) {
  const percent = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
  const isWarning = percent >= 80 && percent < 100;
  const isOver = percent >= 100;
  const color = getCategoryColor(budget.category);

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {budget.category.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {getCategoryLabel(budget.category)}
            </p>
            <p className="text-xs text-slate-400">
              {formatCurrency(budget.spent, currency)} of {formatCurrency(budget.limit, currency)}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {(isWarning || isOver) && (
            <AlertTriangle
              className={clsx('h-4 w-4', isOver ? 'text-red-500' : 'text-yellow-500')}
              title={isOver ? 'Over budget!' : 'Near budget limit'}
            />
          )}
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className={clsx(
            'font-medium',
            isOver ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-slate-500'
          )}>
            {formatPercent(budget.spent, budget.limit)} used
          </span>
          <span className="text-slate-400">
            {formatCurrency(Math.max(0, budget.limit - budget.spent), currency)} left
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-dark-700 overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-500',
              isOver ? 'bg-red-500' : isWarning ? 'bg-yellow-400' : 'bg-green-500'
            )}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
