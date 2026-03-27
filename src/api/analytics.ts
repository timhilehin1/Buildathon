import { apiClient } from './client';

export interface CategoryBreakdown {
  category_id: number;
  category_name: string;
  total: number;
  percentage: number;
}

export interface BankBreakdown {
  bank_source: string;
  total: number;
  percentage: number;
}

export const analyticsApi = {
  categories: async (from: string, to: string): Promise<CategoryBreakdown[]> => {
    const { data } = await apiClient.get('/v1/analytics/categories', { params: { from, to } });
    return data;
  },

  banks: async (from: string, to: string): Promise<BankBreakdown[]> => {
    const { data } = await apiClient.get('/v1/analytics/banks', { params: { from, to } });
    return data;
  },
};
