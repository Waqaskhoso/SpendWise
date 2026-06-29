import api from './api';
import { Transaction, TransactionFilters, PaginatedResponse } from '../types';

export const transactionService = {
  async getAll(filters?: TransactionFilters): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Transaction> {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },

  async update(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    const response = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  async exportCSV(): Promise<Blob> {
    const response = await api.get('/transactions/export', {
      responseType: 'blob',
    });
    return response.data;
  },
};
