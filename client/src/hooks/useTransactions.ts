import { useState, useEffect, useCallback } from 'react';
import { transactionService } from '../services/transactionService';
import { Transaction, TransactionFilters, PaginatedResponse } from '../types';
import { useAuthStore } from '../store/useAuthStore';

export function useTransactions(filters?: TransactionFilters) {
  const [data, setData] = useState<PaginatedResponse<Transaction>>({
    data: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetch = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      const result = await transactionService.getAll(filters);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, JSON.stringify(filters)]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { ...data, loading, error, refetch: fetch };
}

export function useAllTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    transactionService
      .getAll({ limit: 1000 })
      .then((r) => setTransactions(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return { transactions, loading };
}
