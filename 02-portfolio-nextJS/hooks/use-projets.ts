import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { PaginatedResponse, Projet } from '@/types/api';

export function useProjects(params?: Record<string, string>) {
  return useQuery({
    queryKey: qk.projets(params),
    queryFn: () => api.get<PaginatedResponse<Projet>>('/projets', { params }),
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: qk.projet(slug),
    queryFn: () => api.get<Projet>(`/projets/${slug}`),
    enabled: !!slug,
  });
}

export function useProjetById(id: string | number) {
  return useQuery({
    queryKey: qk.projetById(id),
    queryFn: () => api.get<Projet>(`/projets/${id}`, { params: { all: 'true' } }),
    enabled: !!id,
  });
}

export function useCreateProjet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/projets', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.projets(), exact: false }),
  });
}

export function useUpdateProjet(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.put(`/projets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.projets(), exact: false });
      queryClient.invalidateQueries({ queryKey: ['project'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['projet'], exact: false });
    },
  });
}

export function useDeleteProjet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/projets/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.projets(), exact: false }),
  });
}

export function useCreateProjetMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { mediable_type: string; mediable_id: number; type: string; chemin_fichier: string; titre?: string; est_principal?: boolean }) =>
      api.post('/media', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.projets(), exact: false }),
  });
}

export function useDeleteProjetMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/media/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.projets(), exact: false }),
  });
}
