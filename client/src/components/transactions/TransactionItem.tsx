import React from 'react';
import { Edit2, Trash2, Repeat } from 'lucide-react';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import { getCategoryLabel, getCategoryColor } from '../../utils/categoryUtils';
import { Badge } from '../ui/Badge';
import clsx from 'clsx';

interface TransactionItemProps {
  transaction: Transaction;
  currency: string;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionItem({ transaction, currency, onEdit, onDelete }: TransactionItemProps) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors group">
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
        style={{
          backgroundColor: getCategoryColor(transaction.category) + '20',
          color: getCategoryColor(transaction.category),
        }}
      >
        {transaction.category.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
            {transaction.title}
          </p>
          {transaction.isRecurring && (
            <Repeat className="h-3.5 w-3.5 flex-shrink-0 text-indigo-400" title="Recurring" />
          )}
        </div>
        <p className="text-xs text-slate-400">
          {getCategoryLabel(transaction.category)} · {formatDate(transaction.date)}
        </p>
        {transaction.tags && transaction.tags.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {transaction.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="gray" size="sm">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span
          className={clsx('text-sm font-semibold', {
            'text-green-600': transaction.type === 'income',
            'text-red-500': transaction.type === 'expense',
          })}
        >
          {transaction.type === 'income' ? '+' : '-'}
          {formatCurrency(transaction.amount, currency)}
        </span>

        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
