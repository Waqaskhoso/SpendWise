import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Goal } from '../types';
import { useAuthStore } from '../store/useAuthStore';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();

  const fetch = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/goals');
      setGoals(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { goals, setGoals, loading, error, refetch: fetch };
}
