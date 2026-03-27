import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/src/api/analytics';

export function useCategoryAnalytics(from: string, to: string) {
  return useQuery({
    queryKey: ['analytics', 'categories', from, to],
    queryFn: () => analyticsApi.categories(from, to),
    enabled: !!from && !!to,
  });
}

export function useBankAnalytics(from: string, to: string) {
  return useQuery({
    queryKey: ['analytics', 'banks', from, to],
    queryFn: () => analyticsApi.banks(from, to),
    enabled: !!from && !!to,
  });
}
