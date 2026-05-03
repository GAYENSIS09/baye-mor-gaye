'use client';
import { useEffect, useRef } from 'react';
import { Icons } from '@/components/ui/Icons';

interface DrawerPanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function DrawerPanel({ open, onClose, title, children, footer }: DrawerPanelProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab' && drawerRef.current) {
          const focusable = drawerRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (focusable.length === 0) return;
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
          if (!drawerRef.current.contains(document.activeElement)) { first.focus(); e.preventDefault(); }
        }
      };
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
      setTimeout(() => drawerRef.current?.querySelector<HTMLElement>('button')?.focus(), 50);
      return () => {
        document.removeEventListener('keydown', handleKey);
        document.body.style.overflow = '';
      };
    }
  }, [open, onClose]);

  return (
    <>
      <button
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose} aria-label="Fermer"
      />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-lg bg-[#0A0A0A] border-l border-[#222] shadow-2xl transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#222]">
          <h2 className="text-lg font-bold text-off-white">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-off-white transition-colors" aria-label="Fermer">
            <Icons.close className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto" style={{ height: footer ? 'calc(100% - 120px)' : 'calc(100% - 60px)' }}>
          {children}
        </div>
        {footer && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#222] bg-[#0A0A0A]">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
