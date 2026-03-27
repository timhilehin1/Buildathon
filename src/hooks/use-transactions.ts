import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { transactionsApi, TransactionFilters } from '@/src/api/transactions';

export function useTransactions(filters: TransactionFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['transactions', filters],
    queryFn: ({ pageParam = 1 }) =>
      transactionsApi.list({ ...filters, page: pageParam as number, limit: 20 }),
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useRecentTransactions() {
  return useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => transactionsApi.list({ page: 1, limit: 5 }),
    select: (data) => data.data,
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
