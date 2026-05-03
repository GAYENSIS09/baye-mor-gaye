import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';

interface ToggleLikeData {
  publication_id?: number;
  projet_id?: number;
  likeable_type?: string;
  likeable_id?: number;
  slug?: string; // Utilisé pour identifier la ressource dans le cache
}

/**
 * useToggleLike
 * 
 * Gère l'interaction de "Like" avec une approche "Optimistic UI".
 * L'interface est mise à jour instantanément avant même que l'API ne réponde,
 * garantissant une expérience fluide et haut de gamme.
 */
export function useToggleLike(type: 'publication' | 'project') {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: ToggleLikeData) => {
      // Nettoyage des données pour l'API
      const { slug, ...payload } = data;
      return api.post('/likes/toggle', payload);
    },
    
    onMutate: async (data) => {
      const { slug } = data;
      if (!slug) return;

      const queryKey = type === 'publication' ? qk.publication(slug) : qk.projet(slug);

      // 1. Annuler les fetches sortants pour cette clé
      await qc.cancelQueries({ queryKey });

      // 2. Snapshot de l'état précédent
      const previousData = qc.getQueryData(queryKey);

      // 3. Mise à jour optimiste du cache
      qc.setQueryData(queryKey, (old: Record<string, unknown> | undefined) => {
        if (!old) return old;
        
        const isLiked = !!old.liked;
        const currentLikes = typeof old.likes_count === 'number' ? old.likes_count : 0;
        return {
          ...old,
          liked: !isLiked,
          likes_count: isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1,
        };
      });

      // Retourner le contexte pour le rollback
      return { previousData, queryKey };
    },

    onError: (err, data, context) => {
      // Rollback en cas d'échec de l'API
      if (context?.queryKey && context?.previousData) {
        qc.setQueryData(context.queryKey, context.previousData);
      }
    },

    onSettled: (data, err, variables, context) => {
      // Invalidation finale pour synchroniser avec le serveur
      if (context?.queryKey) {
        qc.invalidateQueries({ queryKey: context.queryKey });
      }
    },
  });
}
