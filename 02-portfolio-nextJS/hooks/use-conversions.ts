import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { PaginatedResponse, Conversion } from '@/types/api';

export function useConversions(params?: Record<string, string>) {
  return useQuery({
    queryKey: qk.conversions(params),
    queryFn: () => api.get<PaginatedResponse<Conversion>>('/conversions', { params }),
  });
}

export function useImportConversion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { url_externe: string }) => api.post('/conversions/import', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.edt(), exact: true }),
  });
}
