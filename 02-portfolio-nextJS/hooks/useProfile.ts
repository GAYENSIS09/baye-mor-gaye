'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { ProfilePublic, Competence } from '@/types/api';

export type { Competence };

export function useProfilePublic() {
  return useQuery({
    queryKey: qk.profile(),
    queryFn: () => api.get<ProfilePublic>('/profile/public'),
  });
}

export function useProfile() {
  const { data, isLoading, isError } = useProfilePublic();
  return {
    profile: data ?? null,
    loading: isLoading,
    error: isError,
  };
}

export function useCompetences() {
  return useQuery({
    queryKey: qk.competences(),
    queryFn: () => api.get<Competence[]>('/competences'),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.put('/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.profile(), exact: true, refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'], exact: true, refetchType: 'all' });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string; new_password_confirmation: string }) =>
      api.put('/password', data),
  });
}
