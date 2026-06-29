import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateUtils';
import { getCategoryLabel, getCategoryColor } from '../../utils/categoryUtils';
import clsx from 'clsx';

interface RecentTransactionsProps {
  transactions: Transaction[];
  currency: string;
}

export function RecentTransactions({ transactions, currency }: RecentTransactionsProps) {
  const navigate = useNavigate();

  return (
    <Card padding="none">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-dark-700">
        <CardHeader
          title="Recent Transactions"
          subtitle="Your latest financial activity"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
              View all
            </Button>
          }
        />
      </div>
      <div className="divide-y divide-slate-100 dark:divide-dark-700">
        {transactions.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-slate-400">
            No transactions yet
          </div>
        ) : (
          transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors"
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: getCategoryColor(transaction.category) + '20' }}
              >
                {transaction.type === 'income' ? (
                  <ArrowDownLeft
                    className="h-5 w-5"
                    style={{ color: getCategoryColor(transaction.category) }}
                  />
                ) : (
                  <ArrowUpRight
                    className="h-5 w-5"
                    style={{ color: getCategoryColor(transaction.category) }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {transaction.title}
                </p>
                <p className="text-xs text-slate-400">
                  {getCategoryLabel(transaction.category)} · {formatDate(transaction.date)}
                </p>
              </div>
              <span
                className={clsx('text-sm font-semibold', {
                  'text-green-600': transaction.type === 'income',
                  'text-red-500': transaction.type === 'expense',
                })}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount, currency)}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
