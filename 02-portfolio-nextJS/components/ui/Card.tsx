import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  as?: 'div' | 'article' | 'section';
  onClick?: () => void;
}

export function Card({ children, className = '', hover = true, as: Tag = 'div', onClick }: CardProps) {
  return (
    <Tag
      className={`bg-[#111] rounded-lg border border-[#222] p-6 ${
        hover ? 'hover:border-acid/30 transition-all' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-[#111] rounded-lg border border-[#222] p-6 space-y-3 animate-pulse ${className}`}>
      <div className="h-4 bg-[#222] rounded w-3/4" />
      <div className="h-3 bg-[#222] rounded w-1/2" />
      <div className="h-3 bg-[#222] rounded w-full" />
    </div>
  );
}
