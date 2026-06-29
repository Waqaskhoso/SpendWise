import api from './api';
import { Budget } from '../types';

export const budgetService = {
  async getAll(month?: number, year?: number): Promise<Budget[]> {
    const params = new URLSearchParams();
    if (month) params.append('month', String(month));
    if (year) params.append('year', String(year));
    const response = await api.get(`/budgets?${params.toString()}`);
    return response.data;
  },

  async create(budget: Omit<Budget, 'id' | 'spent'>): Promise<Budget> {
    const response = await api.post('/budgets', budget);
    return response.data;
  },

  async update(id: string, budget: Partial<Budget>): Promise<Budget> {
    const response = await api.put(`/budgets/${id}`, budget);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  },
};
