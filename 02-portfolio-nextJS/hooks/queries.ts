// Re-exports from per-entity hook files for backward compatibility
export { useProfilePublic, useProfile } from './useProfile';
export {
  usePublications,
  usePublication,
  usePublicationById,
} from './use-publications';
export {
  useProjects,
  useProject,
  useProjetById,
} from './use-projets';
export { useExperiences } from './use-experiences';
export { useFormations } from './use-formations';
export { useCertifications } from './use-certifications';
export { useCompetences } from './useProfile';
export { useDomaines } from './use-domaines';
export { useContacts } from './use-contacts';
export { useCommentairesEnAttente, useMesCommentaires } from './use-commentaires';
export { useNotifications } from './use-notifications';
export { useRessources } from './use-ressources';
export { useRappels } from './use-rappels';
export { useEdt, useEvenements } from './use-edt';
export { useConversions } from './use-conversions';

// Custom hooks still defined here
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import type { Stats } from '@/types/api';

export function useStatistiques(periode?: string) {
  return useQuery({
    queryKey: qk.statistiques(periode),
    queryFn: () => api.get<Stats>('/statistiques', { params: periode ? { periode } : {} }),
  });
}
