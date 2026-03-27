import { apiClient } from './client';

export interface Transaction {
  id: string;
  amount: number;
  merchant_raw?: string;
  category_id?: number;
  category_name?: string;
  bank_source: string;
  trigger_type: 'SMS' | 'SCREENSHOT' | 'MANUAL' | 'SELF_TRANSFER';
  status: 'PENDING' | 'VERIFIED' | 'DUPLICATE' | 'SELF_TRANSFER';
  timestamp: string;
  updated_at: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  category_id?: number;
  status?: string;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export const transactionsApi = {
  list: async (filters: TransactionFilters = {}): Promise<PaginatedTransactions> => {
    const { data } = await apiClient.get('/v1/transactions', { params: filters });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/transactions/${id}`);
  },
};
