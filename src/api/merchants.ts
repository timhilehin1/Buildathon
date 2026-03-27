import { apiClient } from './client';

export const merchantsApi = {
  map: async (rawName: string, categoryId: number): Promise<void> => {
    await apiClient.post('/v1/merchants', { raw_name: rawName, category_id: categoryId });
  },

  lookup: async (rawName: string): Promise<{ category_id: number } | null> => {
    try {
      const { data } = await apiClient.get(`/v1/merchants/${encodeURIComponent(rawName)}`);
      return data;
    } catch {
      return null;
    }
  },
};
