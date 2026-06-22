'use client';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-[#222] rounded ${className}`} />;
}
