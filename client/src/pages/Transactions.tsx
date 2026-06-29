import React, { useState } from 'react';
import { Plus, Download, Upload } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { TransactionFilters } from '../components/transactions/TransactionFilters';
import { TransactionList } from '../components/transactions/TransactionList';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { CSVImport } from '../components/transactions/CSVImport';
import { useTransactions } from '../hooks/useTransactions';
import { transactionService } from '../services/transactionService';
import { exportTransactionsCSV } from '../services/exportService';
import { useAppStore } from '../store/useAppStore';
import { Transaction, TransactionFilters as Filters } from '../types';
import api from '../services/api';

export function Transactions() {
  const { currency } = useAppStore();
  const [filters, setFilters] = useState<Filters>({ page: 1, limit: 20 });
  const [modalOpen, setModalOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const { data, total, page, totalPages, loading, error, refetch } = useTransactions(filters);

  const handleAdd = async (formData: Omit<Transaction, 'id'>) => {
    await transactionService.create(formData);
    setModalOpen(false);
    refetch();
  };

  const handleUpdate = async (formData: Omit<Transaction, 'id'>) => {
    if (!editing) return;
    await transactionService.update(editing.id, formData);
    setEditing(null);
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return;
    await transactionService.delete(id);
    refetch();
  };

  const handleExport = () => exportTransactionsCSV(data);

  const handleBatchImport = async (transactions: Omit<Transaction, 'id'>[]) => {
    // Import one by one (could be optimized with a batch endpoint)
    for (const tx of transactions) {
      await api.post('/transactions', tx);
    }
    refetch();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div />
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="h-4 w-4" />}
            onClick={handleExport}
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Upload className="h-4 w-4" />}
            onClick={() => setImportOpen(true)}
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
          >
            Import CSV
          </Button>
          <Button
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setModalOpen(true)}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      <TransactionFilters
        filters={filters}
        onChange={(f) => setFilters({ ...f, page: 1, limit: 20 })}
      />

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <TransactionList
        transactions={data}
        currency={currency}
        loading={loading}
        total={total}
        page={page}
        totalPages={totalPages}
        onEdit={(t) => setEditing(t)}
        onDelete={handleDelete}
        onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
        onAdd={() => setModalOpen(true)}
      />

      {/* Add Transaction Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Transaction">
        <TransactionForm onSubmit={handleAdd} onCancel={() => setModalOpen(false)} currency={currency} />
      </Modal>

      {/* Edit Transaction Modal */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Transaction">
        {editing && (
          <TransactionForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} currency={currency} />
        )}
      </Modal>

      {/* CSV Import Modal */}
      <Modal isOpen={importOpen} onClose={() => { setImportOpen(false); refetch(); }} title="Import from CSV">
        <CSVImport
          onImport={handleBatchImport}
          onClose={() => { setImportOpen(false); refetch(); }}
          currency={currency}
        />
      </Modal>
    </div>
  );
}
