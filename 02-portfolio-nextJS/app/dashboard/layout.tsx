'use client';
import { useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import NotificationBell from '@/components/NotificationBell';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardBreadcrumbs from '@/components/DashboardBreadcrumbs';
import { Icons } from '@/components/ui/Icons';
import { auditLog, useAuditMount, useAuditRender, useAuditHook, useAuditEarlyReturn } from '@/lib/react-audit';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useAuditMount('DashboardLayout');
  const { utilisateur, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useAuditHook('DashboardLayout', 'useAuth');
  useAuditHook('DashboardLayout', 'useRouter');
  useAuditHook('DashboardLayout', 'useState', { name: 'sidebarOpen' });

  useEffect(() => {
    useAuditHook('DashboardLayout', 'useEffect', { phase: 'init', deps: ['utilisateur', 'loading', 'router'] });
    if (!loading && !utilisateur) {
      auditLog.query('DashboardLayout', '/login (redirect)', undefined, undefined, undefined, undefined);
      router.push('/login');
    }
    return () => {
      useAuditHook('DashboardLayout', 'useEffect', { phase: 'cleanup' });
    };
  }, [utilisateur, loading, router]);

  if (loading) {
    useAuditEarlyReturn('DashboardLayout', 'loading');
    return (
      <div className="min-h-screen bg-off-black flex items-center justify-center" role="status">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-acid border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs text-muted">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!utilisateur) {
    useAuditEarlyReturn('DashboardLayout', 'no utilisateur');
    return null;
  }

  useAuditRender('DashboardLayout', { utilisateur: utilisateur.id, loading, sidebarOpen }, {});

  return (
    <ToastProvider>
      <div className="min-h-screen bg-off-black flex">
        <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-h-screen flex flex-col" id="main-content" role="main">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-[#222]">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-muted hover:text-off-white p-1 rounded hover:bg-[#222] transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Icons.menu className="w-6 h-6" aria-hidden />
            </button>
            <Link href="/" className="font-mono text-sm tracking-widest text-acid uppercase">
              BMG<span className="text-muted">.</span>dev
            </Link>
            <NotificationBell />
          </div>

          {/* Desktop top bar */}
          <div className="hidden lg:flex items-center justify-end gap-4 px-8 py-3 border-b border-[#222]">
            <NotificationBell />
          </div>

          {/* Page content */}
          <div className="flex-1 p-4 md:p-8 overflow-y-auto">
            <DashboardBreadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
