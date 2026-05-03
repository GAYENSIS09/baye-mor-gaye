import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { PaginatedResponse, Publication } from '@/types/api';

export function usePublications(params?: Record<string, string>) {
  return useQuery({
    queryKey: qk.publications(params),
    queryFn: () => api.get<PaginatedResponse<Publication>>('/publications', { params }),
  });
}

export function usePublication(slug: string) {
  return useQuery({
    queryKey: qk.publication(slug),
    queryFn: () => api.get<Publication>(`/publications/${slug}`),
    enabled: !!slug,
  });
}

export function usePublicationsDashboard() {
  return useQuery({
    queryKey: qk.publicationsDashboard(),
    queryFn: () => api.get<PaginatedResponse<Publication>>('/publications'),
  });
}

export function usePublicationById(id: string | number) {
  return useQuery({
    queryKey: qk.publicationById(id),
    queryFn: () => api.get<Publication>(`/publications/${id}`),
    enabled: !!id,
  });
}

export function useCreatePublication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post('/publications', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.publications() }),
  });
}

export function useUpdatePublication(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.put(`/publications/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.publications() });
      queryClient.invalidateQueries({ queryKey: ['publication'] });
    },
  });
}

export function useDeletePublication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/publications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.publications() }),
  });
}
