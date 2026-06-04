import { apiClient } from './client';

export interface Profile {
  first_name: string;
  last_name: string;
  username: string;
  date_of_birth?: string;
  country?: string;
  state?: string;
  avatar_url?: string;
  leaderboard_opt_in: boolean;
  notification_preferences?: { push: boolean; email: boolean };
}

export interface PayoutAccount {
  bank_name: string;
  bank_code: string;
  account_number: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar_url?: string;
  total_points: number;
  streak_months: number;
}

export const profileApi = {
  create: async (profile: Profile): Promise<Profile> => {

    const { data } = await apiClient.post('/v1/profile', profile);

    return data;
  },

  get: async (): Promise<Profile> => {
    const { data } = await apiClient.get('/v1/profile');
    return data;
  },

  update: async (patch: Partial<Profile>): Promise<Profile> => {
    const { data } = await apiClient.put('/v1/profile', patch);
    return data;
  },

  getPayoutAccount: async (): Promise<PayoutAccount | null> => {
    const { data } = await apiClient.get('/v1/profile/payout-account');
    return data;
  },

  setPayoutAccount: async (account: PayoutAccount): Promise<void> => {
    await apiClient.post('/v1/profile/payout-account', account);
  },

  deletePayoutAccount: async (): Promise<void> => {
    await apiClient.delete('/v1/profile/payout-account');
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const { data } = await apiClient.get('/v1/leaderboard');
    return data;
  },

  exportData: async (): Promise<unknown[]> => {
    const { data } = await apiClient.get('/v1/account/export');
    return data;
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/v1/account');
  },
};
