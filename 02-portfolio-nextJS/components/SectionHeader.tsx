'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { Icons } from '@/components/ui/Icons';

export type FilterOption = {
  label: string;
  value: string;
};

export interface SectionHeaderProps {
  breadcrumb?: Array<{ label: string; href?: string }>;
  backHref?: string;
  backLabel?: string;
  number?: string;
  title: string;
  subtitle?: string;
  total?: number;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  filterVariant?: 'tabs' | 'chips';
  actions?: ReactNode;
  children?: ReactNode;
}

export function SectionHeader({
  breadcrumb,
  backHref,
  backLabel,
  number,
  title,
  subtitle,
  total,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  activeFilter,
  onFilterChange,
  filterVariant = 'tabs',
  actions,
  children,
}: SectionHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-[#111] border-b border-[#222] sticky top-0 z-40 mb-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-4 space-y-3">
        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
          <nav aria-label="Fil d'Ariane" className="hidden md:flex items-center gap-1.5 text-xs font-mono text-muted">
            {breadcrumb.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <Icons.chevronRight className="w-3 h-3 text-muted/40" aria-hidden />}
                {item.href ? (
                  <Link href={item.href} className="hover:text-off-white transition-colors duration-200">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-off-white">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Back button + Title row */}
        <div className="flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="flex items-center gap-1 text-sm text-muted hover:text-off-white transition-colors font-mono shrink-0 group"
              aria-label={backLabel || 'Retour'}
            >
              <Icons.chevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" aria-hidden />
              <span className="hidden sm:inline">{backLabel || 'Retour'}</span>
            </Link>
          )}

          {!backHref && backLabel && (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-sm text-muted hover:text-off-white transition-colors font-mono shrink-0 group"
              aria-label={backLabel || 'Retour'}
            >
              <Icons.chevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" aria-hidden />
              <span className="hidden sm:inline">{backLabel || 'Retour'}</span>
            </button>
          )}

          <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
              {number && (
                <span className="font-mono text-acid text-xs uppercase tracking-widest shrink-0">
                  {number}
                </span>
              )}
              <h1 className="text-xl md:text-2xl font-bold text-off-white truncate">{title}</h1>
              {total !== undefined && (
                <span className="text-xs font-mono text-muted bg-[#222] px-2 py-0.5 rounded-full shrink-0">
                  {total}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs md:text-sm text-muted mt-0.5 hidden md:block">{subtitle}</p>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>

        {/* Search */}
        {onSearchChange && (
          <div className="relative">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" aria-hidden />
            <input
              type="text"
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder || 'Rechercher...'}
              aria-label={searchPlaceholder || 'Rechercher'}
              className="w-full bg-[#222] border border-[#333] rounded-lg pl-10 pr-4 py-2 text-sm text-off-white placeholder-muted font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50 transition-colors"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-off-white transition-colors"
                aria-label="Effacer la recherche"
              >
                <Icons.close className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Filters */}
        {filters && filters.length > 0 && onFilterChange && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex gap-1.5" role="tablist" aria-label="Filtres">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => onFilterChange(f.value)}
                  role="tab"
                  aria-selected={activeFilter === f.value}
                  className={`whitespace-nowrap font-mono text-xs uppercase tracking-widest transition-all duration-200 shrink-0 ${
                    filterVariant === 'chips'
                      ? activeFilter === f.value
                        ? 'bg-acid text-black px-3 py-1 rounded-full'
                        : 'bg-[#222] text-muted hover:text-off-white px-3 py-1 rounded-full'
                      : activeFilter === f.value
                      ? 'bg-acid text-black px-3 py-1.5 rounded'
                      : 'bg-[#222] text-muted hover:text-off-white px-3 py-1.5 rounded'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {children}
      </div>
    </header>
  );
}