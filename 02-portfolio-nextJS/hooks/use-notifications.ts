import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { PaginatedResponse, Notification } from '@/types/api';

export function useNotifications(params?: Record<string, string>, enabled?: boolean) {
  return useQuery({
    queryKey: qk.notifications(params),
    queryFn: () => api.get<PaginatedResponse<Notification>>('/notifications', { params: params as Record<string, string> }),
    enabled,
    refetchInterval: enabled ? 30000 : undefined,
  });
}

export function useReadNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.notifications() }),
  });
}

export function useReadAllNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.notifications() }),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.notifications() }),
  });
}
