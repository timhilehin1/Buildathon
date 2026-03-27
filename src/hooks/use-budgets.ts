import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi } from '@/src/api/budgets';

export function useBudgets() {
  return useQuery({
    queryKey: ['budgets'],
    queryFn: budgetsApi.list,
  });
}

export function useBudgetDetail(month: string) {
  return useQuery({
    queryKey: ['budgets', month],
    queryFn: () => budgetsApi.get(month),
    enabled: !!month,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ month, items }: { month: string; items: { category_id: number; amount: number }[] }) =>
      budgetsApi.create(month, items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  });
}

export function useUpdateBudgetItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ month, categoryId, amount }: { month: string; categoryId: number; amount: number }) =>
      budgetsApi.updateItem(month, categoryId, amount),
    onSuccess: (_data, vars) => queryClient.invalidateQueries({ queryKey: ['budgets', vars.month] }),
  });
}

export function useDeleteBudgetItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ month, categoryId }: { month: string; categoryId: number }) =>
      budgetsApi.deleteItem(month, categoryId),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', vars.month] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
}

export function useAddBudgetItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ month, item }: { month: string; item: { category_id: number; amount: number } }) =>
      budgetsApi.addItem(month, item),
    onSuccess: (_data, vars) => queryClient.invalidateQueries({ queryKey: ['budgets', vars.month] }),
  });
}
