'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/ui/Icons';

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

function MediaThumbnail({ item, onClick }: { item: GalleryItem; onClick: () => void }) {
  const thumbSrc = item.vignette || item.url;
  const isVid = isVideo(item.type, item.url);

  return (
    <button onClick={onClick} className="relative aspect-video rounded-lg overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50">
      {isVid && !isYouTube(item.url, item.type) ? (
        <video src={item.url} className="object-cover w-full h-full" />
      ) : (
        <Image src={thumbSrc} alt={item.titre || ''} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
      )}
      {isVid && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
          <Icons.play className="w-12 h-12 text-white drop-shadow-lg" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <p className="text-xs text-white truncate">{item.titre || (isVid ? 'Vidéo' : 'Image')}</p>
      </div>
    </button>
  );
}

function LightboxContent({ item, onClose }: { item: GalleryItem; onClose: () => void }) {
  const isVid = isVideo(item.type, item.url);
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
      <div className="relative max-w-5xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
        {isVid && ytId ? (
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={"" + "https://www.youtube.com/embed/" + ytId + "?autoplay=1"}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : isVid ? (
          <video src={item.url} controls autoPlay className="max-h-[85vh] mx-auto rounded-lg" />
        ) : (
          <Image src={item.url} alt={item.titre || ''} width={1920} height={1080} className="object-contain max-h-[85vh] mx-auto rounded-lg" />
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

  const galleryItems: GalleryItem[] = items.map((m) => ({
    id: m.id,
    url: isYouTube(m.url, m.type) && m.url ? (m.url.startsWith('http') ? m.url : 'https://www.youtube.com/watch?v=' + m.url) : m.url,
    type: m.type,
    titre: m.titre,
    vignette: m.vignette,
  }));

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {galleryItems.slice(0, 5).map((item, idx) => (
          <div key={item.id} className={idx === 0 ? 'col-span-2 row-span-2' : ''}>
            <MediaThumbnail item={item} onClick={() => openLightbox(idx)} />
          </div>
        ))}
        {galleryItems.length > 5 && (
          <button onClick={() => openLightbox(5)}
            className="aspect-video rounded-lg bg-[#222] border border-[#333] flex items-center justify-center text-muted hover:text-off-white hover:border-acid/40 transition-colors font-mono text-sm">
            +{galleryItems.length - 5}
          </button>
        )}
      </div>

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

export function CompactMediaRow({ items }: MediaGalleryProps) {
  if (!items || items.length === 0) return null;

  const firstImage = items.find((m) => m.type === 'image' || (!isVideo(m.type, m.url)));
  const extraCount = items.length - 1;
  const imageUrl = firstImage?.vignette || firstImage?.url || '';

  return (
    <div className="flex items-center gap-2 mt-3">
      <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 bg-[#222]">
        {firstImage ? (
          <Image src={imageUrl} alt="" fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">+</div>
        )}
      </div>
      {extraCount > 0 && (
        <span className="text-xs text-muted font-mono">{'+' + extraCount + ' média' + (extraCount > 1 ? 's' : '')}</span>
      )}
    </div>
  );
}

export function MiniMediaGallery({ items }: MediaGalleryProps) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 2);

  if (!items || items.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {visible.map((m) => {
          const isVid = isVideo(m.type, m.url);
          const src = m.vignette || m.url;
          return (
            <div key={m.id} className="relative w-20 h-14 shrink-0 rounded overflow-hidden bg-[#222] group">
              <Image src={src} alt={m.titre || ''} fill className="object-cover" />
              {isVid && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Icons.play className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          );
        })}
        {items.length > 2 && !expanded && (
          <button onClick={() => setExpanded(true)}
            className="w-14 h-14 shrink-0 rounded bg-[#222] border border-[#333] flex items-center justify-center text-xs text-muted hover:text-off-white transition-colors font-mono">
            {'+' + (items.length - 2)}
          </button>
        )}
      </div>
    </div>
  );
}
