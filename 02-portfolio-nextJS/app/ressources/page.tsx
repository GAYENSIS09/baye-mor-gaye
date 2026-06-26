'use client';
import { useState, useEffect, useRef } from 'react';
import { useRessources, useDomaines } from '@/hooks/queries';
import { getMediaUrl } from '@/lib/media';
import { SectionHeader } from '@/components/SectionHeader';
import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { ActionButton, LoadMoreButton, Pagination } from '@/components/ActionBar';
import { CardContainer, CardImage, CardContent, CardTitle, CardDescription } from '@/components/CardContainer';
import { MediaPreview, MediaGalleryPreview } from '@/components/MediaPreview';
import MediaViewer from '@/components/MediaViewer';
import SkeletonCard from '@/components/SkeletonCard';
import { Icons } from '@/components/ui/Icons';
import type { Ressource, Media } from '@/types/api';

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <Icons.file className="w-5 h-5" aria-hidden />,
  image: <Icons.file className="w-5 h-5" aria-hidden />,
  video: <Icons.file className="w-5 h-5" aria-hidden />,
  lien: <Icons.external className="w-5 h-5" aria-hidden />,
  youtube: <Icons.play className="w-5 h-5" aria-hidden />,
};

function getMediaTypeIcon(media: Media): React.ReactNode {
  const key = media.type?.toLowerCase() || '';
  for (const [k, icon] of Object.entries(FILE_ICONS)) {
    if (key.includes(k)) return icon;
  }
  return <Icons.file className="w-5 h-5" aria-hidden />;
}

function getFirstCover(resource: Ressource): string | null {
  if (resource.medias && resource.medias.length > 0) {
    const img = resource.medias.find(m => m.type === 'image');
    if (img?.chemin_fichier) return getMediaUrl(img.chemin_fichier);
  }
  return null;
}

function ResourcePreviewModal({ resource, onClose }: { resource: Ressource; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const cover = getFirstCover(resource);
  const firstMedia = resource.medias?.[0];
  const previewUrl = firstMedia ? getMediaUrl(firstMedia.chemin_fichier) : null;

  useEffect(() => {
    if (firstMedia && (firstMedia.type === 'lien' || firstMedia.type === 'youtube' || firstMedia.type === 'document') && previewUrl) {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
      onClose();
      return;
    }
    setTimeout(() => closeRef.current?.focus(), 50);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); };
  }, []);

  return (
    <div ref={modalRef} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-2 md:p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={resource.titre}>
      <button ref={closeRef} onClick={onClose} className="absolute top-2 right-2 md:top-4 md:right-4 text-white/50 hover:text-white z-10 transition-colors bg-black/40 rounded-full p-1.5" aria-label="Fermer">
        <Icons.close className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <div className="relative w-full max-h-[95dvh] md:max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
        {previewUrl ? (
          <MediaViewer src={previewUrl} alt={resource.titre} className="w-full h-[90dvh] md:h-[88vh] mx-auto rounded-lg" />
        ) : (
          <div className="w-full min-w-0 bg-[#111] border border-[#222] rounded-lg p-6 md:p-8 text-center">
            <Icons.file className="w-12 h-12 md:w-16 md:h-16 mx-auto text-muted/50 mb-4" aria-hidden />
            <h3 className="text-off-white text-lg font-semibold mb-2">{resource.titre}</h3>
            {resource.domaine && (
              <span className="text-xs bg-acid/10 text-acid px-2 py-0.5 rounded font-mono">{resource.domaine.nom}</span>
            )}
            {resource.description && (
              <p className="text-muted text-sm mt-4 max-w-md mx-auto">{resource.description}</p>
            )}
          </div>
        )}
        <p className="text-center text-xs md:text-sm text-white/60 mt-2 md:mt-3 font-mono truncate px-2">{resource.titre}</p>
      </div>
    </div>
  );
}

function ResourceCard({ resource, onPreview }: { resource: Ressource; onPreview?: (r: Ressource) => void }) {
  const cover = getFirstCover(resource);
  const firstMedia = resource.medias?.[0];
  const icon = firstMedia ? getMediaTypeIcon(firstMedia) : <Icons.file className="w-5 h-5" aria-hidden />;

  // Show card even without media - use a fallback icon

  return (
    <button onClick={() => onPreview?.(resource)}
      className="bg-[#111] rounded-lg border border-[#222] hover:border-acid/30 transition-all group flex flex-col overflow-hidden text-left w-full">
      {cover && (
        <div className="relative aspect-video overflow-hidden bg-[#1a1a1a]">
          <MediaPreview src={cover} alt={resource.titre} aspectRatio="video" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {!cover && <span className="text-xl shrink-0 mt-0.5">{icon}</span>}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-off-white group-hover:text-acid transition-colors truncate">{resource.titre}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {resource.domaine && (
                <span className="text-xs bg-acid/10 text-acid px-2 py-0.5 rounded font-mono">{resource.domaine.nom}</span>
              )}
            </div>
          </div>
        </div>
        {resource.description && (
          <p className="text-sm text-muted mt-2 line-clamp-2">{resource.description}</p>
        )}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted">
          <span className="font-mono ml-auto">
            {new Date(resource.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
    </button>
  );
}

export default function RessourcesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [domaineFilter, setDomaineFilter] = useState('');
  const [previewResource, setPreviewResource] = useState<Ressource | null>(null);
  const params: Record<string, string> = { page: String(currentPage) };
  if (search) params.search = search;
  if (domaineFilter) params.domaine = domaineFilter;
  const { data: ressourcesRes, isLoading, isError, refetch } = useRessources(params);
  const ressources = ressourcesRes?.data ?? [];
  const lastPage = ressourcesRes?.last_page ?? 1;
  const total = ressourcesRes?.total ?? 0;
  const { data: domaines = [] } = useDomaines();

  const filterOptions = [
    { value: '', label: 'Tous' },
    ...domaines.map((d) => ({ value: String(d.id), label: d.nom })),
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <SectionHeader
        breadcrumb={[{ label: 'Accueil', href: '/' }, { label: 'Ressources' }]}
        title="Ressources"
        subtitle="Documents, fichiers et ressources téléchargeables."
        total={total}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
        filters={filterOptions}
        activeFilter={domaineFilter}
        onFilterChange={(v) => { setDomaineFilter(v); setCurrentPage(1); }}
        filterVariant="chips"
      />

      <main className="max-w-6xl mx-auto p-4 py-8">
        {isLoading ? (
          <ResponsiveGrid columns={3} gap={4}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </ResponsiveGrid>
        ) : isError ? (
          <div className="text-center py-16">
            <Icons.warning className="w-12 h-12 mx-auto text-muted/30 mb-4" role="img" aria-label="Erreur" />
            <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur lors du chargement des ressources</p>
            <ActionButton variant="primary" onClick={() => refetch()}>Réessayer</ActionButton>
          </div>
        ) : ressources.length === 0 ? (
          <div className="text-center py-16">
            <Icons.file className="w-12 h-12 mx-auto text-muted/30 mb-4" aria-hidden />
            <p className="text-muted font-mono text-sm">Aucune ressource disponible pour le moment.</p>
          </div>
        ) : (
          <ResponsiveGrid columns={3} gap={4}>
            {ressources.map((r) => (
              <ResourceCard key={r.id} resource={r} onPreview={setPreviewResource} />
            ))}
          </ResponsiveGrid>
        )}
        <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
      </main>

      {previewResource && (
        <ResourcePreviewModal resource={previewResource} onClose={() => setPreviewResource(null)} />
      )}
    </div>
  );
}