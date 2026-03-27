import { apiClient } from './client';

export interface Category {
  id: number;
  name: string;
  is_default: boolean;
}

export const categoriesApi = {
  list: async (): Promise<Category[]> => {
    const { data } = await apiClient.get('/v1/categories');
    return data;
  },
};
