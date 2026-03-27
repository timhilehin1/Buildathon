import { apiClient } from './client';

export interface RewardMonth {
  month: string;
  points_earned: number;
  total_spent: number;
  budget_met: boolean;
}

export interface RewardSummary {
  total_points: number;
  redeemable_points: number;
  pending_points: number;
  streak_months: number;
  eligible_for_rewards: boolean;
  history: RewardMonth[];
}

export const rewardsApi = {
  get: async (): Promise<RewardSummary> => {
    const { data } = await apiClient.get('/v1/rewards');
    return data;
  },

  redeem: async (points: number): Promise<void> => {
    await apiClient.post('/v1/rewards/redeem', { points });
  },
};
