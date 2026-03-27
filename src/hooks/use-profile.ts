import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, Profile, PayoutAccount } from '@/src/api/profile';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Profile>) => profileApi.update(patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
}

export function usePayoutAccount() {
  return useQuery({
    queryKey: ['payout-account'],
    queryFn: profileApi.getPayoutAccount,
    retry: false,
  });
}

export function useSetPayoutAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (account: PayoutAccount) => profileApi.setPayoutAccount(account),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payout-account'] }),
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: profileApi.getLeaderboard,
  });
}
