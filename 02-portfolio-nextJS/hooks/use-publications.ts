import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { PaginatedResponse, Publication } from '@/types/api';

export function usePublications(params?: Record<string, string>, enabled = true) {
  return useQuery({
    queryKey: qk.publications(params),
    queryFn: () => api.get<PaginatedResponse<Publication>>('/publications', { params }),
    enabled,
  });
}

export function usePublication(slug: string) {
  return useQuery({
    queryKey: qk.publication(slug),
    queryFn: () => api.get<Publication>(`/publications/${slug}`),
    enabled: !!slug,
  });
}

export function usePublicationById(id: string | number) {
  return useQuery({
    queryKey: qk.publicationById(id),
    queryFn: () => api.get<Publication>(`/publications/${id}`, { params: { all: 'true' } }),
    enabled: !!id,
  });
}

export function useCreatePublication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/publications', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.publications(), exact: false }),
  });
}

export function useUpdatePublication(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.put(`/publications/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.publications(), exact: false });
      queryClient.invalidateQueries({ queryKey: ['publication-slug'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['publication-id'], exact: false });
    },
  });
}

export function useDeletePublication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/publications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.publications(), exact: false }),
  });
}

export function useCreatePublicationMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { mediable_type: string; mediable_id: number; type: string; chemin_fichier: string; titre?: string; est_principal?: boolean }) =>
      api.post('/media', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.publications(), exact: false });
      queryClient.invalidateQueries({ queryKey: ['publication-slug'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['publication-id'], exact: false });
    },
  });
}

export function useDeletePublicationMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.publications(), exact: false });
      queryClient.invalidateQueries({ queryKey: ['publication-slug'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['publication-id'], exact: false });
    },
  });
}
