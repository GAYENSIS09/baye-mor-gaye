'use client';

import Image from 'next/image';
import { ReactNode } from 'react';
import { Icons } from '@/components/ui/Icons';
import { getMediaUrl } from '@/lib/media';

export interface MediaPreviewProps {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | '4/3' | '3/4' | '16/9' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fill?: boolean;
  priority?: boolean;
  onClick?: () => void;
  fallback?: ReactNode;
  showPlayIcon?: boolean;
  isVideo?: boolean;
}

const aspectClasses: Record<string, string> = {
  video: 'aspect-video',
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '3/4': 'aspect-[3/4]',
  '16/9': 'aspect-[16/9]',
  auto: '',
};

const sizeClasses = {
  sm: 'w-16 h-12 rounded overflow-hidden',
  md: 'w-full aspect-video rounded-xl overflow-hidden',
  lg: 'w-full aspect-video rounded-xl overflow-hidden',
  xl: 'w-full aspect-[2.4/1] rounded-xl overflow-hidden',
};

export function MediaPreview({
  src,
  alt = '',
  className = '',
  aspectRatio = 'video',
  size = 'md',
  fill = false,
  priority = false,
  onClick,
  fallback,
  showPlayIcon = false,
  isVideo = false,
}: MediaPreviewProps) {
  const resolvedSrc = src ? getMediaUrl(src) : null;
  
  if (!resolvedSrc) {
    return (
      <div className={`relative bg-[#1a1a1a] ${sizeClasses[size]} ${className} flex items-center justify-center`}>
        {fallback || (
          <Icons.file className="w-8 h-8 text-muted/50" aria-hidden />
        )}
      </div>
    );
  }

  const isVideoType = isVideo || resolvedSrc.match(/\.(mp4|webm|ogg|mov)$/i);
  const mediaType = resolvedSrc.startsWith('http') ? 'external' : 'local';

  if (fill) {
    return (
      <div className={`relative ${aspectClasses[aspectRatio]} overflow-hidden rounded-xl ${className}`} onClick={onClick}>
        <Image
          src={resolvedSrc}
          alt={alt}
          fill
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority={priority}
          unoptimized={mediaType === 'external'}
        />
        {showPlayIcon && isVideoType && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
            <Icons.play className="w-12 h-12 text-white drop-shadow-lg" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`} onClick={onClick}>
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
        unoptimized={mediaType === 'external'}
      />
      {showPlayIcon && isVideoType && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
          <Icons.play className="w-8 h-8 text-white drop-shadow-lg" />
        </div>
      )}
    </div>
  );
}

export interface MediaGalleryProps {
  items: Array<{
    id: number;
    url: string;
    type: string;
    titre?: string | null;
    vignette?: string | null;
  }>;
  maxVisible?: number;
  className?: string;
  onItemClick?: (index: number) => void;
}

export function MediaGalleryPreview({
  items,
  maxVisible = 5,
  className = '',
  onItemClick,
}: MediaGalleryProps) {
  if (!items || items.length === 0) return null;

  const visibleItems = items.slice(0, maxVisible);
  const remaining = items.length - maxVisible;

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 ${className}`}>
      {visibleItems.map((item, idx) => {
        const isVid = item.type === 'video' || item.type === 'youtube' || !!item.url?.match(/\.(mp4|webm|ogg|mov)$/i);
        const thumbSrc = item.vignette || item.url;

        return (
          <div key={item.id} className={idx === 0 ? 'col-span-2 row-span-2 md:col-span-1 md:row-span-1' : ''}>
            <button
              onClick={() => onItemClick?.(idx)}
              className="relative aspect-video rounded-lg overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50"
            >
              {isVid && item.type !== 'youtube' ? (
                <video src={getMediaUrl(item.url) || item.url} className="object-cover w-full h-full" />
              ) : (
                <MediaPreview
                  src={thumbSrc}
                  alt={item.titre || ''}
                  fill
                  aspectRatio="video"
                  showPlayIcon={isVid}
                  isVideo={isVid}
                />
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
          </div>
        );
      })}
      {remaining > 0 && (
        <button
          onClick={() => onItemClick?.(maxVisible)}
          className="aspect-video rounded-lg bg-[#222] border border-[#333] flex items-center justify-center text-muted hover:text-off-white hover:border-acid/40 transition-colors font-mono text-sm"
        >
          +{remaining}
        </button>
      )}
    </div>
  );
}

export interface CompactMediaRowProps {
  items: Array<{
    id: number;
    url: string;
    type: string;
    titre?: string | null;
    vignette?: string | null;
  }>;
  className?: string;
}

export function CompactMediaRow({
  items,
  className = '',
}: CompactMediaRowProps) {
  if (!items || items.length === 0) return null;

  const firstImage = items.find((m) => m.type === 'image' || !m.type?.match(/video|youtube/i));
  const extraCount = items.length - 1;
  const rawUrl = firstImage?.vignette || firstImage?.url || '';
  const imageUrl = getMediaUrl(rawUrl) ?? rawUrl;

  return (
    <div className={`flex items-center gap-2 mt-3 ${className}`}>
      <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 bg-[#222]">
        {firstImage ? (
          <MediaPreview src={imageUrl} alt="" fill aspectRatio="square" />
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