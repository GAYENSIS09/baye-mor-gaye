import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { Certification } from '@/types/api';

export function useCertifications() {
  return useQuery({
    queryKey: qk.certifications(),
    queryFn: () => api.get<Certification[]>('/certifications'),
  });
}

export function useCreateCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/certifications', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.certifications() });
      queryClient.invalidateQueries({ queryKey: qk.profile() });
    },
  });
}

export function useUpdateCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) => api.put(`/certifications/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.certifications() });
      queryClient.invalidateQueries({ queryKey: qk.profile() });
    },
  });
}

export function useDeleteCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/certifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.certifications() });
      queryClient.invalidateQueries({ queryKey: qk.profile() });
    },
  });
}
