import { useMemo } from 'react';
import type { Experience, Formation, Certification } from '@/types/api';

export interface KpiData {
  years: number;
  experiences: number;
  formations: number;
  certifications: number;
  competences: number;
}

export function useKpi(
  experiences: Experience[],
  formations: Formation[],
  certifications: Certification[],
  competencesCount: number,
) {
  return useMemo<KpiData | null>(() => {
    const yearsExp = experiences.reduce((max, e) => {
      const start = new Date(e.date_debut).getFullYear();
      const end = e.est_actuel ? new Date().getFullYear() : (e.date_fin ? new Date(e.date_fin).getFullYear() : start);
      return Math.max(max, end - start);
    }, 0);

    return {
      years: Math.max(yearsExp, 1),
      experiences: experiences.length,
      formations: formations.length,
      certifications: certifications.length,
      competences: competencesCount,
    };
  }, [experiences, formations, certifications, competencesCount]);
}
