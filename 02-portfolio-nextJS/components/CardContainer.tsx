'use client';

import { ReactNode } from 'react';

interface CardContainerProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  as?: 'article' | 'div' | 'button' | 'a';
  href?: string;
  onClick?: () => void;
}

export function CardContainer({
  children,
  className = '',
  hover = false,
  as: Component = 'article',
  href,
  onClick,
}: CardContainerProps) {
  const baseClasses = 'rounded-2xl overflow-hidden flex flex-col h-full bg-[#111] border border-[#222]';
  const hoverClasses = hover ? 'transition-colors duration-300 hover:border-acid/40' : '';
  const linkClasses = (href || onClick) ? 'group' : '';

  const combinedClasses = `${baseClasses} ${hoverClasses} ${linkClasses} ${className}`;

  if (href) {
    return (
      <a href={href} className={combinedClasses}>
        {children}
      </a>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={combinedClasses} type="button">
        {children}
      </button>
    );
  }

  return (
    <Component className={combinedClasses}>
      {children}
    </Component>
  );
}

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  aspectRatio?: 'video' | 'square' | '4/3' | '3/4' | '16/9';
}

export function CardImage({
  src,
  alt,
  className = '',
  priority = false,
  fill = true,
  aspectRatio = 'video',
}: CardImageProps) {
  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '3/4': 'aspect-[3/4]',
    '16/9': 'aspect-[16/9]',
  };

  return (
    <div className={`relative overflow-hidden rounded-xl ${aspectClasses[aspectRatio]} ${className}`}>
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading={priority ? 'eager' : 'lazy'}
      />
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`p-5 flex-1 flex flex-col ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
  level?: 'h2' | 'h3' | 'h4';
}

export function CardTitle({ children, className = '', level = 'h3' }: CardTitleProps) {
  const Component = level;
  return (
    <Component className={`text-off-white text-lg font-body font-semibold truncate ${className}`}>
      {children}
    </Component>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
  lines?: 1 | 2 | 3;
}

export function CardDescription({ children, className = '', lines = 2 }: CardDescriptionProps) {
  const lineClamp = `line-clamp-${lines}`;
  return (
    <p className={`text-muted text-sm leading-relaxed mt-2 flex-1 ${lineClamp} ${className}`}>
      {children}
    </p>
  );
}

interface CardMetaProps {
  children: ReactNode;
  className?: string;
}

export function CardMeta({ children, className = '' }: CardMetaProps) {
  return (
    <div className={`flex items-center gap-3 mt-3 text-xs text-muted ${className}`}>
      {children}
    </div>
  );
}

interface CardTagsProps {
  tags: string[];
  maxVisible?: number;
  className?: string;
}

export function CardTags({ tags, maxVisible = 4, className = '' }: CardTagsProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 mt-3 ${className}`}>
      {tags.slice(0, maxVisible).map((tag) => (
        <span key={tag} className="tag">
          {tag}
        </span>
      ))}
      {tags.length > maxVisible && (
        <span className="tag">+{tags.length - maxVisible}</span>
      )}
    </div>
  );
}

interface CardActionsProps {
  children: ReactNode;
  className?: string;
}

export function CardActions({ children, className = '' }: CardActionsProps) {
  return (
    <div className={`flex items-center gap-2 mt-4 pt-3 border-t border-[#222] ${className}`}>
      {children}
    </div>
  );
}