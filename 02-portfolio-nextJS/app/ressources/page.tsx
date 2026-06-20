'use client';
import { useState, useEffect, useRef } from 'react';
import { useRessources } from '@/hooks/queries';
import Link from 'next/link';
import Image from 'next/image';
import Pagination from '@/components/Pagination';
import { Skeleton } from '@/components/Skeleton';
import { Icons } from '@/components/ui/Icons';
import MediaViewer from '@/components/MediaViewer';
import type { Ressource, MediaQualification } from '@/types/api';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp', 'svg'];
const STORAGE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '/storage') || 'http://localhost:8000/storage';

function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) return path;
  return `${STORAGE_URL}/${path.replace(/^\//, '')}`;
}

function getFirstCover(resource: Ressource): string | null {
  if (resource.media && resource.media.length > 0) {
    const img = resource.media.find(m => m.type === 'image');
    if (img?.chemin_fichier) return getMediaUrl(img.chemin_fichier);
  }
  return null;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <Icons.file className="w-5 h-5" aria-hidden />,
  image: <Icons.file className="w-5 h-5" aria-hidden />,
  video: <Icons.file className="w-5 h-5" aria-hidden />,
};

function getMediaTypeIcon(media: MediaQualification): React.ReactNode {
  const key = media.type?.toLowerCase() || '';
  for (const [k, icon] of Object.entries(FILE_ICONS)) {
    if (key.includes(k)) return icon;
  }
  return <Icons.file className="w-5 h-5" aria-hidden />;
}

function ResourcePreviewModal({ resource, onClose }: { resource: Ressource; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const cover = getFirstCover(resource);
  const firstMedia = resource.media?.[0];
  const previewUrl = firstMedia ? getMediaUrl(firstMedia.chemin_fichier) : null;

  useEffect(() => {
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
    <div ref={modalRef} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={resource.titre}>
      <button ref={closeRef} onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white z-10 transition-colors" aria-label="Fermer">
        <Icons.close className="w-8 h-8" />
      </button>
      <div className="relative max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
        {previewUrl ? (
          <MediaViewer src={previewUrl} alt={resource.titre} className="max-h-[85vh] mx-auto rounded-lg" />
        ) : (
          <div className="bg-[#111] border border-[#222] rounded-lg p-8 text-center">
            <Icons.file className="w-16 h-16 mx-auto text-muted/50 mb-4" aria-hidden />
            <h3 className="text-off-white text-lg font-semibold mb-2">{resource.titre}</h3>
            {resource.domaine && (
              <span className="text-xs bg-acid/10 text-acid px-2 py-0.5 rounded font-mono">{resource.domaine.nom}</span>
            )}
            {resource.description && (
              <p className="text-muted text-sm mt-4 max-w-md mx-auto">{resource.description}</p>
            )}
          </div>
        )}
        <p className="text-center text-sm text-white/60 mt-3 font-mono">{resource.titre}</p>
      </div>
    </div>
  );
}

function ResourceCard({ resource, onPreview }: { resource: Ressource; onPreview?: (r: Ressource) => void }) {
  const cover = getFirstCover(resource);
  const firstMedia = resource.media?.[0];
  const icon = firstMedia ? getMediaTypeIcon(firstMedia) : <Icons.file className="w-5 h-5" aria-hidden />;

  if (!firstMedia && !cover) return null;

  const content = (
    <>
      {cover && (
        <div className="aspect-video relative overflow-hidden bg-[#1a1a1a] rounded-t-lg">
          <Image src={cover} alt={resource.titre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
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
    </>
  );

  return (
    <button onClick={() => onPreview?.(resource)} className="bg-[#111] rounded-lg border border-[#222] hover:border-acid/30 transition-all group flex flex-col overflow-hidden text-left w-full">
      {content}
    </button>
  );
}

export default function RessourcesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [previewResource, setPreviewResource] = useState<Ressource | null>(null);
  const { data: ressourcesRes, isLoading, isError, refetch } = useRessources({ page: String(currentPage) });
  const ressources = ressourcesRes?.data ?? [];
  const lastPage = ressourcesRes?.last_page ?? 1;
  const total = ressourcesRes?.total ?? 0;

  return (
    <div className="min-h-screen bg-off-black">
      <div className="max-w-6xl mx-auto px-6 py-32">
        <div className="flex items-baseline gap-6 mb-20">
          <span className="font-mono text-acid text-xs uppercase tracking-widest">Ressources</span>
          <h1 className="font-display text-5xl md:text-7xl text-white uppercase tracking-tight">
            Ressources
          </h1>
        </div>

        <div className="border-t border-[#222] pt-16">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#111] p-6 rounded border border-[#222] space-y-3">
                  <div className="flex items-start gap-4 mb-3">
                    <Skeleton className="w-8 h-8" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-16">
              <Icons.warning className="w-12 h-12 mx-auto text-muted/30 mb-4" role="img" aria-label="Erreur" />
              <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur lors du chargement des ressources</p>
              <button
                onClick={() => refetch()}
                className="bg-acid text-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-acid/90 transition-colors rounded"
              >
                Réessayer
              </button>
            </div>
          ) : ressources.length === 0 ? (
            <div className="text-center py-16">
              <Icons.file className="w-12 h-12 mx-auto text-muted/30 mb-4" aria-hidden />
              <p className="text-muted font-mono text-sm">Aucune ressource disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ressources.map((r) => (
                <ResourceCard key={r.id} resource={r} onPreview={setPreviewResource} />
              ))}
            </div>
          )}
          <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
        </div>
      </div>

      {previewResource && (
        <ResourcePreviewModal resource={previewResource} onClose={() => setPreviewResource(null)} />
      )}
    </div>
  );
}