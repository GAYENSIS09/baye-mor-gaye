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
      queryClient.invalidateQueries({ queryKey: qk.formations(), exact: true });
      queryClient.invalidateQueries({ queryKey: qk.profile(), exact: true });
    },
  });
}

export function useUpdateFormation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (arg: ({ id: number } & Record<string, unknown>) | FormData) => {
      if (arg instanceof FormData) {
        const id = Number(arg.get('id'));
        arg.delete('_method');
        arg.delete('id');
        return api.put(`/formations/${id}`, arg);
      }
      const { id, ...data } = arg;
      return api.put(`/formations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.formations(), exact: true });
      queryClient.invalidateQueries({ queryKey: qk.profile(), exact: true });
    },
  });
}

export function useDeleteFormation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/formations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.formations(), exact: true });
      queryClient.invalidateQueries({ queryKey: qk.profile(), exact: true });
    },
  });
}
