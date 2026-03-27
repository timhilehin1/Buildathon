import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rewardsApi } from '@/src/api/rewards';

export function useRewards() {
  return useQuery({
    queryKey: ['rewards'],
    queryFn: rewardsApi.get,
  });
}

export function useRedeem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (points: number) => rewardsApi.redeem(points),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rewards'] }),
  });
}
