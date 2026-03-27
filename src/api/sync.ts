import { apiClient } from './client';

export interface SyncTransaction {
  id: string;
  amount: number;
  bank_source: string;
  trigger_type: string;
  status: string;
  timestamp: string;
  updated_at: string;
  merchant_raw?: string;
  category_id?: number;
}

export type SyncResultCode =
  | 'SYNCED'
  | 'DUPLICATE_SKIPPED'
  | 'MERGE_CANDIDATE'
  | 'CONFLICT_REJECTED'
  | 'SELF_TRANSFER_SKIPPED'
  | 'TIMESTAMP_OUT_OF_RANGE'
  | 'ZERO_IMAGE_POLICY_VIOLATION'
  | 'VALIDATION_ERROR';

export interface SyncResult {
  id: string;
  result: SyncResultCode;
}

export interface SyncResponse {
  results: SyncResult[];
}

export const syncApi = {
  push: async (transactions: SyncTransaction[]): Promise<SyncResponse> => {
    const { data } = await apiClient.post('/sync', { transactions });
    return data;
  },
};
