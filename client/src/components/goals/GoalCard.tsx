import React from 'react';
import { Edit2, Trash2, CheckCircle } from 'lucide-react';
import { Goal } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import clsx from 'clsx';

interface GoalCardProps {
  goal: Goal;
  currency: string;
  onEdit: (g: Goal) => void;
  onDelete: (id: string) => void;
}

export function GoalCard({ goal, currency, onEdit, onDelete }: GoalCardProps) {
  const percent =
    goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
  const isComplete = percent >= 100;

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-lg font-bold"
            style={{ backgroundColor: goal.color }}
          >
            {isComplete ? '✓' : goal.title.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{goal.title}</p>
            <p className="text-xs text-slate-400">Deadline: {formatDate(goal.deadline)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isComplete && <CheckCircle className="h-4 w-4 text-green-500" />}
          <button
            onClick={() => onEdit(goal)}
            className="p-1.5 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {formatCurrency(goal.currentAmount, currency)}
          </span>
          <span className="text-slate-400">
            of {formatCurrency(goal.targetAmount, currency)}
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-dark-700 overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-700', {
              'bg-green-500': isComplete,
            })}
            style={{
              width: `${Math.min(percent, 100)}%`,
              backgroundColor: isComplete ? undefined : goal.color,
            }}
          />
        </div>
        <p className={clsx('text-xs font-medium', isComplete ? 'text-green-600' : 'text-slate-500')}>
          {isComplete ? 'Goal achieved!' : `${formatPercent(goal.currentAmount, goal.targetAmount)} complete`}
        </p>
      </div>
    </div>
  );
}
