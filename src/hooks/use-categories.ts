import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/src/api/categories';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
    staleTime: 1000 * 60 * 60,
  });
}
