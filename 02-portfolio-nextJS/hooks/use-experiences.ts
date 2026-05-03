import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { Experience } from '@/types/api';

export function useExperiences() {
  return useQuery({
    queryKey: qk.experiences(),
    queryFn: () => api.get<Experience[]>('/experiences'),
  });
}

export function useCreateExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/experiences', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.experiences() });
      queryClient.invalidateQueries({ queryKey: qk.profile() });
    },
  });
}

export function useUpdateExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) => api.put(`/experiences/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.experiences() });
      queryClient.invalidateQueries({ queryKey: qk.profile() });
    },
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/experiences/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.experiences() });
      queryClient.invalidateQueries({ queryKey: qk.profile() });
    },
  });
}
