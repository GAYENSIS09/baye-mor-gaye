import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { PaginatedResponse, Ressource } from '@/types/api';

export function useRessources(params?: Record<string, string>) {
  return useQuery({
    queryKey: qk.ressources(params),
    queryFn: () => api.get<PaginatedResponse<Ressource>>('/ressources', { params }),
  });
}

export function useCreateRessource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/ressources', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.ressources(), exact: false }),
  });
}

export function useDeleteRessource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/ressources/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.ressources(), exact: false }),
  });
}

export function useUpdateRessource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) => api.put(`/ressources/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.ressources(), exact: false }),
  });
}

export function useCreateRessourceMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { mediable_type: string; mediable_id: number; type: string; chemin_fichier: string; titre?: string; est_principal?: boolean }) =>
      api.post('/media', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.ressources(), exact: false }),
  });
}

export function useUpdateRessourceMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; titre?: string; ordre?: number; est_principal?: boolean }) =>
      api.put(`/media/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.ressources(), exact: false }),
  });
}

export function useDeleteRessourceMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/media/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.ressources(), exact: false }),
  });
}
