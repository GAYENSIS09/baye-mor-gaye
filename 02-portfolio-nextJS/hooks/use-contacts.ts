import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { PaginatedResponse, Contact } from '@/types/api';

export function useContacts(params?: { est_lu?: string }) {
  return useQuery({
    queryKey: qk.contacts(params),
    queryFn: () => api.get<PaginatedResponse<Contact>>('/contacts', { params: params as Record<string, string> }),
  });
}

export function useContactForm() {
  return useMutation({
    mutationFn: (data: { nom: string; email: string; sujet?: string; message: string }) =>
      api.post('/contact', data),
  });
}

export function useReadContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.patch(`/contacts/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.contacts(), exact: false }),
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/contacts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.contacts(), exact: false }),
  });
}
