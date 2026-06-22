import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';

export function useCreateCompetence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/competences', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.competences(), exact: true }),
  });
}

export function useDeleteCompetence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/competences/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.competences(), exact: true }),
  });
}

export function useUpdateCompetence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) => api.put(`/competences/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.competences(), exact: true }),
  });
}
