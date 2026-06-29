import { useState, useEffect, useCallback } from 'react';
import { budgetService } from '../services/budgetService';
import { Budget } from '../types';
import { getCurrentMonth, getCurrentYear } from '../utils/dateUtils';
import { useAuthStore } from '../store/useAuthStore';

export function useBudget(month?: number, year?: number) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const m = month || getCurrentMonth();
  const y = year || getCurrentYear();

  const fetch = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      const result = await budgetService.getAll(m, y);
      setBudgets(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, m, y]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { budgets, setBudgets, loading, error, refetch: fetch };
}
