import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { PaginatedResponse, Commentaire } from '@/types/api';

export function useCommentairesEnAttente(params?: Record<string, string>, enabled = true) {
  return useQuery({
    queryKey: qk.commentairesEnAttente(),
    queryFn: () => api.get<PaginatedResponse<Commentaire>>('/commentaires/en-attente', { params }),
    enabled,
  });
}

export function useMesCommentaires() {
  return useQuery({
    queryKey: qk.mesCommentaires(),
    queryFn: () => api.get<PaginatedResponse<Commentaire>>('/commentaires/mes-commentaires'),
  });
}

export function useCreateCommentaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { contenu: string; commentable_type: string; commentable_id: number; parent_id?: number }) =>
      api.post('/commentaires', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.publications(), exact: false });
      queryClient.invalidateQueries({ queryKey: qk.commentaires(), exact: false });
      queryClient.invalidateQueries({ queryKey: qk.mesCommentaires() });
    },
  });
}

export function useApprouverCommentaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.put(`/commentaires/${id}/approuver`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.commentairesEnAttente() });
      queryClient.invalidateQueries({ queryKey: qk.commentaires(), exact: false });
    },
  });
}

export function useRejeterCommentaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.put(`/commentaires/${id}/rejeter`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.commentairesEnAttente() });
      queryClient.invalidateQueries({ queryKey: qk.commentaires(), exact: false });
    },
  });
}

export function useUpdateCommentaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, contenu }: { id: number; contenu: string }) =>
      api.put(`/commentaires/${id}`, { contenu }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.publications(), exact: false });
      queryClient.invalidateQueries({ queryKey: qk.commentaires(), exact: false });
      queryClient.invalidateQueries({ queryKey: qk.mesCommentaires() });
    },
  });
}

export function useDeleteCommentaire() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/commentaires/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.commentaires(), exact: false });
      queryClient.invalidateQueries({ queryKey: qk.mesCommentaires() });
    },
  });
}
