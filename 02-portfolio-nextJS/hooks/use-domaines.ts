import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { Domaine } from '@/types/api';

export function useDomaines() {
  return useQuery({
    queryKey: qk.domaines(),
    queryFn: () => api.get<Domaine[]>('/domaines'),
  });
}

export function useCreateDomaine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/domaines', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.domaines(), exact: true }),
  });
}

export function useDeleteDomaine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/domaines/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.domaines(), exact: true }),
  });
}

export function useUpdateDomaine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) => api.put(`/domaines/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.domaines(), exact: true }),
  });
}
