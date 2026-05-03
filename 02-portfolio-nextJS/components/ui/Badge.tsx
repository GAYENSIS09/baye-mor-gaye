import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'acid' | 'success' | 'warning' | 'error';
  className?: string;
}

const styles = {
  default: 'bg-[#222] text-muted',
  acid:    'bg-acid/10 text-acid',
  success: 'bg-green-900/30 text-green-300',
  warning: 'bg-amber-500/10 text-amber-400',
  error:   'bg-red-900/30 text-red-300',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded font-mono ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
