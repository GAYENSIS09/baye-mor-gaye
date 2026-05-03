import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { Formation } from '@/types/api';

export function useFormations() {
  return useQuery({
    queryKey: qk.formations(),
    queryFn: () => api.get<Formation[]>('/formations'),
  });
}

export function useCreateFormation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/formations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.formations() });
      queryClient.invalidateQueries({ queryKey: qk.profile() });
    },
  });
}

export function useUpdateFormation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) => api.put(`/formations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.formations() });
      queryClient.invalidateQueries({ queryKey: qk.profile() });
    },
  });
}

export function useDeleteFormation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/formations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.formations() });
      queryClient.invalidateQueries({ queryKey: qk.profile() });
    },
  });
}
