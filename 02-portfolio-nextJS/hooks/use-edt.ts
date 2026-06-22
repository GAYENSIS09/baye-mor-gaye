import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { PaginatedResponse, EmploiDuTemps, Evenement } from '@/types/api';

export function useEdt() {
  return useQuery({
    queryKey: qk.edt(),
    queryFn: () => api.get<EmploiDuTemps[]>('/edt'),
  });
}

export function useEvenements(params?: Record<string, string>) {
  return useQuery({
    queryKey: qk.evenements(params),
    queryFn: () => api.get<PaginatedResponse<Evenement>>('/evenements', { params }),
  });
}

export function useCreateEdt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/edt', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.edt(), exact: true }),
  });
}

export function useToggleEdt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; est_actif: boolean }) =>
      api.put(`/edt/${data.id}`, { est_actif: data.est_actif }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.edt(), exact: true }),
  });
}

export function useDeleteEdt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/edt/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.edt(), exact: true }),
  });
}

export function useCreateEvenement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/evenements', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.evenements(), exact: false });
      queryClient.invalidateQueries({ queryKey: qk.edt(), exact: true });
    },
  });
}

export function useUpdateEvenement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) => api.put(`/evenements/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.evenements(), exact: false });
      queryClient.invalidateQueries({ queryKey: qk.edt(), exact: true });
    },
  });
}

export function useDeleteEvenement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/evenements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.evenements(), exact: false });
      queryClient.invalidateQueries({ queryKey: qk.edt(), exact: true });
    },
  });
}

export function useEdtImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => api.post('/edt/import', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.edt(), exact: true });
      queryClient.invalidateQueries({ queryKey: qk.conversions(), exact: true });
    },
  });
}
