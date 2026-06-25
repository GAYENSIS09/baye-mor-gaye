'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icons';

export interface ActionButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function ActionButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  href,
  disabled = false,
  type = 'button',
  icon,
  iconPosition = 'left',
  fullWidth = false,
}: ActionButtonProps) {
  const variantClasses = {
    primary: 'bg-acid text-black hover:bg-acid/90',
    secondary: 'bg-[#222] text-off-white hover:bg-[#333]',
    ghost: 'text-muted hover:text-acid bg-transparent hover:bg-acid/10',
    danger: 'text-red-400 hover:text-red-300 bg-transparent hover:bg-red-400/10',
    outline: 'border border-[#333] text-off-white hover:border-acid/40 hover:bg-acid/10',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-3 text-sm',
  };

  const baseClasses = 'inline-flex items-center justify-center gap-1.5 font-mono uppercase tracking-widest rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  const content = (
    <>
      {icon && iconPosition === 'left' && <span className="flex items-center">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="flex items-center">{icon}</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses} aria-disabled={disabled}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      aria-disabled={disabled}
    >
      {content}
    </button>
  );
}

export interface ActionBarProps {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end' | 'between';
  gap?: 1 | 2 | 3 | 4;
  wrap?: boolean;
}

export function ActionBar({
  children,
  className = '',
  align = 'start',
  gap = 2,
  wrap = true,
}: ActionBarProps) {
  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  const gapClasses = {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
  };

  return (
    <div className={`flex flex-wrap items-center ${alignClasses[align]} ${gapClasses[gap]} ${wrap ? 'flex-wrap' : 'nowrap'} ${className}`}>
      {children}
    </div>
  );
}

export interface IconButtonProps {
  onClick?: () => void;
  icon: ReactNode;
  label: string;
  variant?: 'ghost' | 'primary' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
  disabled?: boolean;
}

export function IconButton({
  onClick,
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className = '',
  disabled = false,
}: IconButtonProps) {
  const variantClasses = {
    ghost: 'text-muted hover:text-off-white bg-transparent hover:bg-[#222]',
    primary: 'text-black bg-acid hover:bg-acid/90',
    danger: 'text-red-400 hover:text-red-300 bg-transparent hover:bg-red-400/10',
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
  };

  const iconSize = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
  };

  return (
    <button
      onClick={onClick ?? undefined}
      disabled={disabled}
      className={`relative rounded transition-colors disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      aria-label={label}
      aria-disabled={disabled}
    >
      <span className={`${iconSize[size]} flex items-center justify-center`} aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}

export interface StatusBadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: StatusBadgeProps) {
  const variantClasses = {
    default: 'bg-[#222] text-muted border border-[#333]',
    success: 'bg-green-900/20 text-green-400',
    warning: 'bg-yellow-900/20 text-yellow-400',
    danger: 'bg-red-900/20 text-red-400',
    info: 'bg-blue-900/20 text-blue-400',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span className={`inline-flex items-center font-mono uppercase tracking-wider rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}

export interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total?: number;
  onPageChange: (page: number) => void;
  className?: string;
  showTotal?: boolean;
}

export function Pagination({
  currentPage,
  lastPage,
  total,
  onPageChange,
  className = '',
  showTotal = false,
}: PaginationProps) {
  if (lastPage <= 1) return null;

  const pages = Array.from({ length: Math.min(lastPage, 5) }, (_, i) => {
    if (lastPage <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= lastPage - 2) return lastPage - 4 + i;
    return currentPage - 2 + i;
  });

  return (
    <nav className={`flex items-center justify-center gap-2 ${className}`} aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 text-muted hover:text-off-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded"
        aria-label="Page précédente"
      >
        <Icons.chevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-10 h-10 md:w-8 md:h-8 rounded font-mono text-xs transition-colors ${
            currentPage === page
              ? 'bg-acid text-black'
              : 'bg-[#222] text-muted hover:text-off-white'
          }`}
          aria-label={`Page ${page}`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className="p-2 text-muted hover:text-off-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded"
        aria-label="Page suivante"
      >
        <Icons.chevronRight className="w-4 h-4" />
      </button>

      {showTotal && total && (
        <span className="text-xs text-muted font-mono ml-4">
          {total} total
        </span>
      )}
    </nav>
  );
}

export interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  hasMore: boolean;
  className?: string;
  label?: string;
  loadingLabel?: string;
}

export function LoadMoreButton({
  onClick,
  isLoading = false,
  hasMore,
  className = '',
  label = 'Charger plus',
  loadingLabel = 'Chargement...',
}: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <div className="text-center mt-10">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="bg-[#222] text-off-white px-6 py-3 rounded font-mono text-xs uppercase tracking-widest hover:bg-[#333] transition-colors disabled:opacity-50"
      >
        {isLoading ? loadingLabel : label}
      </button>
    </div>
  );
}