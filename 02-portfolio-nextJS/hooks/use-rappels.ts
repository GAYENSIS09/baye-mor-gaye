import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { PaginatedResponse, Rappel } from '@/types/api';

export function useRappels(params?: Record<string, string>) {
  return useQuery({
    queryKey: qk.rappels(params),
    queryFn: () => api.get<PaginatedResponse<Rappel>>('/rappels', { params }),
  });
}

export function useCreateRappel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/rappels', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.rappels() }),
  });
}

export function useDeleteRappel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/rappels/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.rappels() }),
  });
}

export function useUpdateRappel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) => api.put(`/rappels/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.rappels() }),
  });
}
