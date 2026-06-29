import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Transaction } from '../../types';
import { TransactionItem } from './TransactionItem';
import { EmptyState } from '../ui/EmptyState';
import { PageLoader } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';

interface TransactionListProps {
  transactions: Transaction[];
  currency: string;
  loading: boolean;
  total: number;
  page: number;
  totalPages: number;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string) => void;
  onPageChange: (page: number) => void;
  onAdd: () => void;
}

export function TransactionList({
  transactions,
  currency,
  loading,
  total,
  page,
  totalPages,
  onEdit,
  onDelete,
  onPageChange,
  onAdd,
}: TransactionListProps) {
  if (loading) return <PageLoader />;

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={ArrowLeftRight}
        title="No transactions found"
        description="Add your first transaction to start tracking your finances."
        action={{ label: 'Add Transaction', onClick: onAdd }}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 overflow-hidden">
      <div className="px-6 py-3 border-b border-slate-100 dark:border-dark-700 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing {transactions.length} of {total} transactions
        </p>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-dark-700">
        {transactions.map((t) => (
          <TransactionItem
            key={t.id}
            transaction={t}
            currency={currency}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-dark-700 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
