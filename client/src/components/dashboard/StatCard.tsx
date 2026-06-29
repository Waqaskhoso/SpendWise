import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import clsx from 'clsx';

interface StatCardProps {
  title: string;
  amount: number;
  currency?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'purple';
  change?: number;
  changeLabel?: string;
}

const GRADIENTS = {
  blue:   'from-blue-500 to-indigo-600',
  green:  'from-emerald-500 to-teal-600',
  red:    'from-rose-500 to-pink-600',
  purple: 'from-violet-500 to-purple-600',
};

const SHADOWS = {
  blue:   'shadow-blue-200 dark:shadow-blue-900/30',
  green:  'shadow-emerald-200 dark:shadow-emerald-900/30',
  red:    'shadow-rose-200 dark:shadow-rose-900/30',
  purple: 'shadow-violet-200 dark:shadow-violet-900/30',
};

const ICON_BG = {
  blue:   'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  green:  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  red:    'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  purple: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
};

export function StatCard({ title, amount, currency = 'USD', icon: Icon, color, change, changeLabel }: StatCardProps) {
  return (
    <div className={clsx(
      'relative overflow-hidden rounded-2xl bg-white dark:bg-dark-800 p-5',
      'border border-slate-100 dark:border-dark-700',
      'shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5',
    )}>
      {/* Subtle gradient accent top bar */}
      <div className={clsx('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', GRADIENTS[color])} />

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {formatCurrency(amount, currency)}
          </p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {change >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
              )}
              <span className={clsx('text-xs font-semibold', change >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}%
              </span>
              {changeLabel && <span className="text-xs text-slate-400 ml-0.5">{changeLabel}</span>}
            </div>
          )}
        </div>
        <div className={clsx('flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl', ICON_BG[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
