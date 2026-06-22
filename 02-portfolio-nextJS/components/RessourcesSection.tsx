"use client";
import { useState, useEffect, useRef } from 'react';
import { useRessources } from "@/hooks/queries";
import DomaineBadge from "@/components/DomaineBadge";
import { Icons } from '@/components/ui/Icons';
import MediaViewer from '@/components/MediaViewer';
import { CardContainer, CardImage, CardContent, CardTitle, CardDescription, CardMeta } from "@/components/CardContainer";
import { SectionHeader } from "@/components/SectionHeader";
import type { Ressource } from '@/types/api';

const STORAGE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '/storage') || 'http://localhost:8000/storage';

function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${STORAGE_URL}/${path.replace(/^\//, '')}`;
}

function getCover(resource: Ressource): string | null {
  if (resource.medias && resource.medias.length > 0) {
    const img = resource.medias.find(m => m.type === 'image');
    if (img?.chemin_fichier) return getMediaUrl(img.chemin_fichier);
  }
  return null;
}

function PreviewModal({ resource, onClose }: { resource: Ressource; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const firstMedia = resource.medias?.[0];
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
            {resource.domaine && <DomaineBadge nom={resource.domaine.nom} couleur={resource.domaine.couleur} />}
            {resource.description && (
              <p className="text-muted text-sm mt-4">{resource.description}</p>
            )}
          </div>
        )}
        <p className="text-center text-sm text-white/60 mt-3 font-mono">{resource.titre}</p>
      </div>
    </div>
  );
}

function ResourceCard({ resource, onPreview }: { resource: Ressource; onPreview?: (r: Ressource) => void }) {
  const cover = getCover(resource);
  const firstMedia = resource.medias?.[0];

  return (
    <CardContainer onClick={() => onPreview?.(resource)} hover>
      {cover && (
        <CardImage
          src={cover}
          alt={resource.titre}
          aspectRatio="video"
        />
      )}
      <CardContent>
        <div className="flex items-start gap-4">
          {!cover && (
            <span className="text-lg shrink-0 mt-0.5">
              <Icons.file className="w-5 h-5 text-muted" aria-hidden />
            </span>
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm truncate">{resource.titre}</CardTitle>
            {resource.domaine && <DomaineBadge nom={resource.domaine.nom} couleur={resource.domaine.couleur} />}
          </div>
        </div>
        {resource.description && (
          <CardDescription lines={2} className="text-xs">{resource.description}</CardDescription>
        )}
        <CardMeta>
          {firstMedia && (
            <span className="inline-flex items-center gap-1.5 text-xs text-acid font-mono">
              <Icons.download className="w-3 h-3" aria-hidden />
              {firstMedia.type === 'image' ? 'Image' : firstMedia.type === 'video' ? 'Vidéo' : 'Document'}
            </span>
          )}
        </CardMeta>
      </CardContent>
    </CardContainer>
  );
}

export default function RessourcesSection() {
  const [preview, setPreview] = useState<Ressource | null>(null);
  const { data, isLoading } = useRessources({ publique: '1' });
  const ressources = data?.data ?? [];

  return (
    <section id="ressources" className="py-32 px-6 bg-off-black">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          number="06"
          title="Ressources"
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardContainer key={i} className="animate-pulse">
                <div className="aspect-video bg-[#222] rounded-xl" />
                <CardContent>
                  <CardTitle>Chargement...</CardTitle>
                  <CardDescription>Description en cours de chargement</CardDescription>
                </CardContent>
              </CardContainer>
            ))}
          </div>
        ) : ressources.length === 0 ? (
          <div className="text-center py-16">
            <span className="font-mono text-sm text-muted">Aucune ressource disponible.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ressources.map((r) => (
              <ResourceCard key={r.id} resource={r} onPreview={setPreview} />
            ))}
          </div>
        )}
      </div>

      {preview && <PreviewModal resource={preview} onClose={() => setPreview(null)} />}
    </section>
  );
}