'use client';

import { useState } from 'react';
import { useProfilePublic } from '@/hooks/queries';
import { useKpi } from '@/hooks/useKpi';
import Link from 'next/link';
import DomaineBadge from '@/components/DomaineBadge';
import { Skeleton } from '@/components/Skeleton';
import { getMediaUrl } from '@/lib/media';
import { Icons } from '@/components/ui/Icons';
import MediaViewer from '@/components/MediaViewer';
import { SectionHeader } from '@/components/SectionHeader';
import type { Experience, Formation, Certification, Media } from '@/types/api';

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="bg-[#111] border-b border-[#222]">
        <div className="max-w-4xl mx-auto p-4">
          <Skeleton className="h-8 w-32" />
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4 py-8 space-y-8 animate-pulse">
        <div className="bg-[#111] rounded border border-[#222] p-6">
          <div className="flex items-center gap-6 mb-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-20 w-full mb-4" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24 rounded" />
            <Skeleton className="h-10 w-24 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111] rounded border border-[#222] p-4">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
        <div className="bg-[#111] rounded border border-[#222] p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function QualificationMedia({ medias, size = 'md', onOpen }: { medias: Media[]; size?: 'sm' | 'md' | 'lg'; onOpen?: (m: Media) => void }) {
  if (!medias || medias.length === 0) return null;
  const dim = size === 'sm' ? 'w-16 h-16' : size === 'lg' ? 'w-32 h-32' : 'w-24 h-24';
  const first = medias[0];
  const src = getMediaUrl(first.chemin_fichier);
  if (!src) return null;

  return (
    <button onClick={() => onOpen?.(first)} className={`${dim} relative rounded-lg overflow-hidden shrink-0 bg-[#222] border border-[#333] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50`} type="button">
      <MediaViewer src={src} alt={first.titre || ''} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
      {medias.length > 1 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-acid text-black text-[10px] font-mono rounded-full flex items-center justify-center font-bold z-10">
          +{medias.length - 1}
        </span>
      )}
    </button>
  );
}

function MediaLightbox({ media, onClose }: { media: Media; onClose: () => void }) {
  const src = getMediaUrl(media.chemin_fichier);
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={media.titre || 'Média'}>
      <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white z-10 transition-colors" aria-label="Fermer">
        <Icons.close className="w-8 h-8" />
      </button>
      <div className="relative w-full max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
        {src && (
          <MediaViewer src={src} alt={media.titre || ''} className="w-full h-[88vh] mx-auto rounded-lg" />
        )}
        {media.titre && <p className="text-center text-sm text-white/60 mt-3 font-mono">{media.titre}</p>}
      </div>
    </div>
  );
}

function TimelineEntry({ children, date, isLast = false }: { children: React.ReactNode; date: string; isLast?: boolean }) {
  return (
    <div className="relative pl-8 pb-8">
      {!isLast && (
        <div className="absolute left-[11px] top-3 bottom-0 w-px bg-[#333]" aria-hidden="true" />
      )}
      <div className="absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-2 border-[#444] bg-[#0A0A0A] flex items-center justify-center" aria-hidden="true">
        <div className="w-2 h-2 rounded-full bg-acid/60" />
      </div>
      <div className="text-xs text-muted font-mono mb-1">{date}</div>
      {children}
    </div>
  );
}

function ExperienceCard({ exp, onMediaOpen }: { exp: Experience; onMediaOpen?: (m: Media) => void }) {
  const period = `${new Date(exp.date_debut).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} – ${exp.est_actuel ? 'Présent' : exp.date_fin ? new Date(exp.date_fin).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'Présent'}`;
  return (
    <div className="bg-[#111] rounded-lg border border-[#222] p-4 hover:border-acid/20 transition-colors group">
      <div className="flex gap-4">
        <QualificationMedia medias={exp.medias} onOpen={onMediaOpen} />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-off-white group-hover:text-acid transition-colors">{exp.titre}</h4>
          <p className="text-acid text-sm">{exp.entreprise}</p>
          <p className="text-muted text-xs font-mono mt-0.5">{period}{exp.lieu ? ` · ${exp.lieu}` : ''}</p>
          {exp.description && (
            <p className="text-muted text-sm mt-2 line-clamp-2">{exp.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function FormationCard({ formation, onMediaOpen }: { formation: Formation; onMediaOpen?: (m: Media) => void }) {
  const period = `${new Date(formation.date_debut).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} – ${formation.date_fin ? new Date(formation.date_fin).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : 'Présent'}`;
  return (
    <div className="bg-[#111] rounded-lg border border-[#222] p-4 hover:border-acid/20 transition-colors group">
      <div className="flex gap-4">
        <QualificationMedia medias={formation.medias} onOpen={onMediaOpen} />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-off-white group-hover:text-acid transition-colors">{formation.diplome}</h4>
          <p className="text-acid text-sm">{formation.etablissement}</p>
          <p className="text-muted text-xs font-mono mt-0.5">{period}{formation.domaine_etude ? ` · ${formation.domaine_etude}` : ''}</p>
          {formation.description && (
            <p className="text-muted text-sm mt-2 line-clamp-2">{formation.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function CertificationCard({ cert, onMediaOpen }: { cert: Certification; onMediaOpen?: (m: Media) => void }) {
  const date = new Date(cert.date_obtention).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  return (
    <div className="bg-[#111] rounded-lg border border-[#222] p-4 hover:border-acid/20 transition-colors group">
      <div className="flex gap-4">
        <QualificationMedia medias={cert.medias} onOpen={onMediaOpen} />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-off-white group-hover:text-acid transition-colors">{cert.titre}</h4>
          <p className="text-acid text-sm">{cert.organisme}</p>
          <p className="text-muted text-xs font-mono mt-0.5">{date}</p>
          {cert.description && (
            <p className="text-muted text-sm mt-2 line-clamp-2">{cert.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, suffix }: { label: string; value: number | string; suffix?: string }) {
  return (
    <div className="bg-[#111] rounded-lg border border-[#222] p-4 text-center hover:border-acid/20 transition-colors">
      <p className="text-2xl font-bold text-acid font-display">{value}{suffix}</p>
      <p className="text-xs text-muted font-mono uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}

export default function ProfilPage() {
  const profileQuery = useProfilePublic();
  const [lightboxMedia, setLightboxMedia] = useState<Media | null>(null);

  const loading = profileQuery.isLoading;
  const error = profileQuery.isError;
  const profile = profileQuery.data ?? null;
  const experiences = profile?.experiences ?? [];
  const formations = profile?.formations ?? [];
  const certifications = profile?.certifications ?? [];

  const kpiData = useKpi(experiences, formations, certifications, profile?.competences?.length ?? 0);

  if (loading) return <ProfileSkeleton />;

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center" role="alert">
        <div className="text-center">
          <Icons.warning className="w-12 h-12 mx-auto text-muted/30 mb-4" />
          <p className="text-muted font-mono text-sm mb-4">Profil introuvable.</p>
          <Link href="/" className="text-acid text-sm hover:underline font-mono">Retour à l&apos;accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <SectionHeader
        breadcrumb={[{ label: 'Accueil', href: '/' }, { label: 'Profil' }]}
        backHref="/"
        backLabel="Retour à l'accueil"
        title="Profil"
        subtitle={profile.titre_professionnel || 'Parcours et compétences'}
      />

      <main className="max-w-4xl mx-auto p-4 py-8 space-y-8">
        {/* Profile card */}
        <div className="bg-[#111] rounded-lg border border-[#222] p-6 md:p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
            {profile.photo && (
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-acid/20 shrink-0">
                <MediaViewer src={getMediaUrl(profile.photo, profile.updated_at) || ''} alt={profile.nom} fill className="object-cover" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h2 className="text-2xl md:text-3xl font-bold text-off-white">{profile.nom}</h2>
                {profile.titre_professionnel && (
                  <span className="tag text-[10px] self-start md:self-center">{profile.titre_professionnel}</span>
                )}
              </div>
              {profile.localisation && (
                <p className="text-muted text-sm flex items-center gap-1.5 mb-4">
                  <Icons.location className="w-3.5 h-3.5" aria-hidden />
                  {profile.localisation}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {profile.url_github && (
                  <a href={profile.url_github} target="_blank" rel="noopener noreferrer"
                    className="bg-off-white text-black px-4 py-2 rounded-lg text-sm font-mono hover:bg-off-white/90 transition-colors inline-flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
                    GitHub
                  </a>
                )}
                {profile.url_linkedin && (
                  <a href={profile.url_linkedin} target="_blank" rel="noopener noreferrer"
                    className="bg-acid/10 text-acid px-4 py-2 rounded-lg text-sm font-mono hover:bg-acid/20 transition-colors inline-flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    LinkedIn
                  </a>
                )}
                {profile.site_web && (
                  <a href={profile.site_web} target="_blank" rel="noopener noreferrer"
                    className="bg-[#222] text-off-white px-4 py-2 rounded-lg text-sm font-mono hover:bg-[#333] transition-colors inline-flex items-center gap-2">
                    <Icons.external className="w-4 h-4" />
                    Site web
                  </a>
                )}
              </div>
            </div>
          </div>

          {profile.bio && (
            <div className="border-t border-[#222] pt-6">
              <h3 className="font-semibold text-off-white mb-3 font-body">À propos</h3>
              <p className="text-off-white/80 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {profile.domaines && profile.domaines.length > 0 && (
            <div className="border-t border-[#222] pt-6 mt-6">
              <h3 className="font-semibold text-sm text-muted mb-3 font-mono uppercase tracking-wider">Domaines d&apos;intérêt</h3>
              <div className="flex flex-wrap gap-2">
                {profile.domaines.map((d) => (
                  <DomaineBadge key={d.id} nom={d.nom} couleur={d.couleur} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* KPI Stats */}
        {kpiData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <KpiCard label="Années d'exp." value={kpiData.years} suffix="+" />
            <KpiCard label="Compétences" value={kpiData.competences} />
            <KpiCard label="Formations" value={kpiData.formations} />
            <KpiCard label="Certifications" value={kpiData.certifications} />
          </div>
        )}

        {/* Timeline: Experiences, Formations, Certifications */}
        <div className="space-y-8 animate-fade-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
          {experiences.length > 0 && (
            <div className="bg-[#111] rounded-lg border border-[#222] p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <Icons.briefcase className="w-5 h-5 text-acid" aria-hidden />
                <h3 className="text-xl font-bold text-off-white">Expériences professionnelles</h3>
              </div>
              <div className="space-y-3">
                {experiences.map((exp, i) => (
                  <ExperienceCard key={exp.id} exp={exp} onMediaOpen={setLightboxMedia} />
                ))}
              </div>
            </div>
          )}

          {formations.length > 0 && (
            <div className="bg-[#111] rounded-lg border border-[#222] p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <Icons.academic className="w-5 h-5 text-acid" aria-hidden />
                <h3 className="text-xl font-bold text-off-white">Formations</h3>
              </div>
              <div className="space-y-3">
                {formations.map((f) => (
                  <FormationCard key={f.id} formation={f} onMediaOpen={setLightboxMedia} />
                ))}
              </div>
            </div>
          )}

          {certifications.length > 0 && (
            <div className="bg-[#111] rounded-lg border border-[#222] p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <Icons.badge className="w-5 h-5 text-acid" aria-hidden />
                <h3 className="text-xl font-bold text-off-white">Certifications</h3>
              </div>
              <div className="space-y-3">
                {certifications.map((c) => (
                  <CertificationCard key={c.id} cert={c} onMediaOpen={setLightboxMedia} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {lightboxMedia && <MediaLightbox media={lightboxMedia} onClose={() => setLightboxMedia(null)} />}
    </div>
  );
}
