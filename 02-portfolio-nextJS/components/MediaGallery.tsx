'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { Icons } from '@/components/ui/Icons';
import { getMediaUrl } from '@/lib/media';
import { MediaPreview, MediaGalleryPreview } from '@/components/MediaPreview';

export interface GalleryItem {
  id: number;
  url: string;
  type: string;
  titre?: string | null;
  vignette?: string | null;
}

interface MediaGalleryProps {
  items: GalleryItem[];
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function isYouTube(url: string, type?: string): boolean {
  if (type === 'youtube') return true;
  return !!getYouTubeId(url);
}

function isVideo(type?: string, url?: string): boolean {
  if (type === 'video' || type === 'youtube') return true;
  if (url) {
    const videoExts = ['.mp4', '.webm', '.ogg', '.mov'];
    if (videoExts.some((ext) => url.toLowerCase().includes(ext))) return true;
  }
  return false;
}

function LightboxContent({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const isVid = isVideo(item.type, item.url);
  const isPdf = !isVid && (item.type === 'pdf' || item.type === 'document' || !!item.url.match(/\.pdf$/i));
  const ytId = getYouTubeId(item.url);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setTimeout(() => (closeRef.current as HTMLButtonElement)?.focus(), 50);
    const prev = document.activeElement as HTMLElement | null;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && lightboxRef.current) {
        const focusable = lightboxRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); prev?.focus(); };
  }, []);

  return (
    <div ref={lightboxRef} className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={item.titre || 'Média'}>
      <button ref={closeRef} onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white z-10 transition-colors" aria-label="Fermer">
        <Icons.close className="w-8 h-8" />
      </button>
      <div className="relative w-full max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
        {isVid && ytId ? (
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={"https://www.youtube.com/embed/" + ytId + "?autoplay=1"}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : isVid ? (
          <video src={getMediaUrl(item.url) ?? item.url} controls autoPlay className="w-full h-[88vh] mx-auto rounded-lg" />
        ) : isPdf ? (
          <object data={getMediaUrl(item.url) ?? item.url} type="application/pdf" className="w-full h-[88vh] rounded-lg">
            <iframe src={getMediaUrl(item.url) ?? item.url} className="w-full h-[88vh] rounded-lg" title={item.titre || 'PDF'}>
              <p className="text-white/60 text-sm">Votre navigateur ne supporte pas l&apos;affichage des PDF.</p>
            </iframe>
          </object>
        ) : (
          <img src={getMediaUrl(item.url) ?? item.url} alt={item.titre || ''} className="object-contain w-full h-[88vh] mx-auto rounded-lg" />
        )}
        {item.titre && (
          <p className="text-center text-sm text-white/60 mt-3 font-mono">{item.titre}</p>
        )}
      </div>
    </div>
  );
}

export default function MediaGallery({ items }: MediaGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!items || items.length === 0) return null;

  const openLightbox = useCallback((idx: number) => {
    setCurrent(idx);
    setLightbox(true);
  }, []);

  const galleryItems: GalleryItem[] = items.map((m) => {
    let url = m.url;
    if (isYouTube(url, m.type)) {
      const ytId = getYouTubeId(url);
      if (ytId) url = `https://www.youtube.com/watch?v=${ytId}`;
    }
    return {
      id: m.id,
      url: getMediaUrl(url) ?? url,
      type: m.type,
      titre: m.titre,
      vignette: m.vignette ? getMediaUrl(m.vignette) ?? m.vignette : null,
    };
  });

  return (
    <>
      <MediaGalleryPreview
        items={galleryItems}
        maxVisible={5}
        onItemClick={openLightbox}
      />
      <div className="flex gap-1.5 justify-center mt-4">
        {galleryItems.map((_, i) => (
          <button key={i} onClick={() => openLightbox(i)}
            className={'w-2 h-2 rounded-full transition-colors ' + (i === current && lightbox ? 'bg-acid' : 'bg-white/30 hover:bg-white/50')}
            aria-label={'Média ' + (i + 1)} />
        ))}
      </div>

      {lightbox && <LightboxContent item={galleryItems[current]} onClose={() => setLightbox(false)} />}
    </>
  );
}

export function MiniMediaGallery({ items }: MediaGalleryProps) {
  const [expanded, setExpanded] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);
  const visible = expanded ? items : items.slice(0, 2);

  if (!items || items.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {visible.map((m) => {
          const isVid = isVideo(m.type, m.url);
          const rawSrc = m.vignette || m.url;
          const src = getMediaUrl(rawSrc) ?? rawSrc;
          return (
            <button key={m.id} onClick={() => setLightboxItem(m)}
              className="relative w-36 h-24 shrink-0 rounded overflow-hidden bg-[#222] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50">
              <MediaPreview src={src} alt={m.titre || ''} fill aspectRatio="auto" showPlayIcon={isVid} isVideo={isVid} />
            </button>
          );
        })}
        {items.length > 2 && !expanded && (
          <button onClick={() => setExpanded(true)}
            className="w-24 h-24 shrink-0 rounded bg-[#222] border border-[#333] flex items-center justify-center text-sm text-muted hover:text-off-white transition-colors font-mono">
            {'+' + (items.length - 2)}
          </button>
        )}
      </div>
      {lightboxItem && <LightboxContent item={lightboxItem} onClose={() => setLightboxItem(null)} />}
    </div>
  );
}