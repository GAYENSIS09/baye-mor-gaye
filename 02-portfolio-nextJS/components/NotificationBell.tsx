'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/hooks/queries';
import { Icons } from '@/components/ui/Icons';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: notifRes } = useNotifications({ est_lue: 'false' }, true);
  const unread = notifRes?.data ?? [];
  const count = notifRes?.total ?? 0;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="relative text-muted hover:text-off-white transition-colors" aria-label={`Notifications (${count} non lues)`}>
        <Icons.bell className="w-5 h-5" aria-hidden />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-red-500 rounded-full">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-[#111] border border-[#222] rounded-lg shadow-2xl z-50">
          <div className="p-3 border-b border-[#222]">
            <p className="text-xs font-mono text-muted uppercase tracking-widest">Notifications</p>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {unread.length === 0 ? (
              <p className="text-sm text-muted p-4 text-center">Aucune notification</p>
            ) : (
              unread.slice(0, 5).map((n) => (
                <div key={n.id} className="px-3 py-2 border-b border-[#222]/50 last:border-0">
                  <p className="text-sm text-off-white truncate">{n.titre}</p>
                  {n.message && <p className="text-xs text-muted truncate">{n.message}</p>}
                </div>
              ))
            )}
          </div>
          <Link href="/dashboard/notifications" onClick={() => setOpen(false)} className="block p-3 text-center text-xs text-acid hover:bg-[#222] rounded-b-lg font-mono uppercase tracking-widest">
            Voir tout →
          </Link>
        </div>
      )}
    </div>
  );
}
