'use client';

import { ReactNode } from 'react';

export interface ResponsiveGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 1 | 2 | 3 | 4 | 6 | 8;
  className?: string;
  as?: 'div' | 'section' | 'main';
}

export function ResponsiveGrid({
  children,
  columns = 3,
  gap = 6,
  className = '',
  as: Component = 'div',
}: ResponsiveGridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    6: 'gap-6',
    8: 'gap-8',
  };

  return (
    <Component className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </Component>
  );
}

export interface ResponsiveGridItemProps {
  children: ReactNode;
  span?: 1 | 2 | 3 | 4;
  className?: string;
}

export function ResponsiveGridItem({
  children,
  span = 1,
  className = '',
}: ResponsiveGridItemProps) {
  const spanClasses = {
    1: '',
    2: 'md:col-span-2',
    3: 'xl:col-span-3',
    4: 'lg:col-span-4',
  };

  return (
    <div className={`${spanClasses[span]} ${className}`}>
      {children}
    </div>
  );
}

export interface ListGridProps {
  children: ReactNode;
  gap?: 2 | 3 | 4;
  className?: string;
}

export function ListGrid({ children, gap = 4, className = '' }: ListGridProps) {
  const gapClasses = {
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
  };

  return (
    <div className={`space-y-0 ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}

export interface ListGridItemProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  border?: boolean;
}

export function ListGridItem({
  children,
  className = '',
  hover = false,
  border = true,
}: ListGridItemProps) {
  const baseClasses = 'p-4';
  const hoverClasses = hover ? 'hover:bg-[#1a1a1a] transition-colors' : '';
  const borderClasses = border ? 'border-b border-[#222]' : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${borderClasses} ${className}`}>
      {children}
    </div>
  );
}

