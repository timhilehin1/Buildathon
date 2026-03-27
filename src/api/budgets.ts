import { apiClient } from './client';

export interface BudgetItem {
  category_id: number;
  category_name: string;
  amount: number;
  spent: number;
  remaining: number;
}

export interface BudgetSummary {
  month: string;
  total_budgeted: number;
  total_spent: number;
}

export interface BudgetDetail {
  id: number;
  month: string;
  items: BudgetItem[];
}

export const budgetsApi = {
  list: async (): Promise<BudgetSummary[]> => {
    const { data } = await apiClient.get('/v1/budgets');
    return data;
  },

  get: async (month: string): Promise<BudgetDetail> => {
    const { data } = await apiClient.get(`/v1/budgets/${month}`);
    return data;
  },

  create: async (month: string, items: { category_id: number; amount: number }[]): Promise<BudgetDetail> => {
    const { data } = await apiClient.post('/v1/budgets', { month, items });
    return data;
  },

  delete: async (month: string): Promise<void> => {
    await apiClient.delete(`/v1/budgets/${month}`);
  },

  addItem: async (month: string, item: { category_id: number; amount: number }): Promise<void> => {
    await apiClient.post(`/v1/budgets/${month}/items`, item);
  },

  updateItem: async (month: string, categoryId: number, amount: number): Promise<void> => {
    await apiClient.put(`/v1/budgets/${month}/items/${categoryId}`, { amount });
  },

  deleteItem: async (month: string, categoryId: number): Promise<void> => {
    await apiClient.delete(`/v1/budgets/${month}/items/${categoryId}`);
  },
};
