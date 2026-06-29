import React, { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { BudgetCard } from '../components/budget/BudgetCard';
import { BudgetForm } from '../components/budget/BudgetForm';
import { EmptyState } from '../components/ui/EmptyState';
import { PageLoader } from '../components/ui/LoadingSpinner';
import { useBudget } from '../hooks/useBudget';
import { budgetService } from '../services/budgetService';
import { useAppStore } from '../store/useAppStore';
import { Budget as BudgetType } from '../types';
import { getCurrentMonth, getCurrentYear } from '../utils/dateUtils';

export function Budget() {
  const { currency } = useAppStore();
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());
  const { budgets, loading, refetch } = useBudget(month, year);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BudgetType | null>(null);

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overallPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const handleCreate = async (data: Omit<BudgetType, 'id' | 'spent'>) => {
    await budgetService.create(data);
    setModalOpen(false);
    refetch();
  };

  const handleUpdate = async (data: Omit<BudgetType, 'id' | 'spent'>) => {
    if (!editing) return;
    await budgetService.update(editing.id, data);
    setEditing(null);
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this budget?')) return;
    await budgetService.delete(id);
    refetch();
  };

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 px-3 py-2 text-sm"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 px-3 py-2 text-sm"
          >
            {[-1, 0, 1].map((o) => (
              <option key={o} value={getCurrentYear() + o}>{getCurrentYear() + o}</option>
            ))}
          </select>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>
          Set Budget
        </Button>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">Overall Budget</span>
            <span className="text-slate-500">{totalSpent.toFixed(0)} / {totalBudget.toFixed(0)} {currency}</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-dark-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                overallPercent >= 100 ? 'bg-red-500' : overallPercent >= 80 ? 'bg-yellow-400' : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.min(overallPercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">{overallPercent.toFixed(1)}% of total budget used</p>
        </div>
      )}

      {/* Budget cards */}
      {budgets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No budgets set"
          description="Set budgets for different categories to track your spending."
          action={{ label: 'Set Budget', onClick: () => setModalOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              currency={currency}
              onEdit={setEditing}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Set Budget">
        <BudgetForm
          initial={{ month, year }}
          onSubmit={handleCreate}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Budget">
        {editing && (
          <BudgetForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}
