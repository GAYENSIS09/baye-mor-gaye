"use client";
import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { useRessources } from "@/hooks/queries";
import DomaineBadge from "@/components/DomaineBadge";
import { Icons } from '@/components/ui/Icons';
import MediaViewer from '@/components/MediaViewer';
import type { Ressource } from '@/types/api';

const STORAGE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '/storage') || 'http://localhost:8000/storage';

function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${STORAGE_URL}/${path.replace(/^\//, '')}`;
}

function getCover(resource: Ressource): string | null {
  if (resource.media && resource.media.length > 0) {
    const img = resource.media.find(m => m.type === 'image');
    if (img?.chemin_fichier) return getMediaUrl(img.chemin_fichier);
  }
  return null;
}

function PreviewModal({ resource, onClose }: { resource: Ressource; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
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
  const firstMedia = resource.media?.[0];

  return (
    <button onClick={() => onPreview?.(resource)}
      className="bg-[#111] border border-[#222] rounded-lg overflow-hidden hover:border-acid/40 transition-all group block text-left w-full">
      {cover && (
        <div className="aspect-video relative overflow-hidden bg-[#1a1a1a]">
          <Image src={cover} alt={resource.titre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {!cover && (
            <span className="text-lg shrink-0 mt-0.5">
              <Icons.file className="w-5 h-5 text-muted" aria-hidden />
            </span>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-off-white font-semibold text-sm truncate">{resource.titre}</h3>
            {resource.domaine && <DomaineBadge nom={resource.domaine.nom} couleur={resource.domaine.couleur} />}
          </div>
        </div>
        {resource.description && (
          <p className="text-xs text-muted mt-2 line-clamp-2">{resource.description}</p>
        )}
        <div className="flex items-center gap-3 mt-3">
          {firstMedia && (
            <span className="inline-flex items-center gap-1.5 text-xs text-acid font-mono">
              <Icons.download className="w-3 h-3" aria-hidden />
              {firstMedia.type === 'image' ? 'Image' : firstMedia.type === 'video' ? 'Vidéo' : 'Document'}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function RessourcesSection() {
  const [preview, setPreview] = useState<Ressource | null>(null);
  const { data, isLoading } = useRessources({ publique: '1' });
  const ressources = data?.data ?? [];

  return (
    <section id="ressources" className="py-32 px-6 bg-off-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-baseline gap-6 mb-16">
          <span className="font-mono text-acid text-xs uppercase tracking-widest">06</span>
          <h2 className="font-display text-5xl md:text-7xl text-white uppercase tracking-tight">Ressources</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <span className="font-mono text-sm text-muted animate-pulse">Chargement...</span>
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