'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useNotifications } from '@/hooks/queries';
import { useReadNotification, useReadAllNotifications, useDeleteNotification } from '@/hooks/mutations';
import { useToast } from '@/contexts/ToastContext';
import Pagination from '@/components/Pagination';
import ConfirmDialog from '@/components/ConfirmDialog';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function NotificationsDashboardPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const params: Record<string, string> = { page: String(currentPage) };
  if (!showAll) params.est_lue = 'false';
  const { data: notificationsResponse, isLoading } = useNotifications(params, true);
  const notifications = notificationsResponse?.data ?? [];
  const lastPage = notificationsResponse?.last_page ?? 1;
  const total = notificationsResponse?.total ?? 0;
  const readNotification = useReadNotification();
  const readAllNotifications = useReadAllNotifications();
  const deleteNotification = useDeleteNotification();
  const toast = useToast();

  async function markAsRead(id: number) {
    try {
      await readNotification.mutateAsync(id);
      toast.success('Notification marquée comme lue');
    } catch {
      toast.error('Erreur');
    }
  }

  async function markAllAsRead() {
    try {
      await readAllNotifications.mutateAsync();
      toast.success('Toutes les notifications marquées comme lues');
    } catch {
      toast.error('Erreur');
    }
  }

  async function deleteNotif(id: number) {
    try {
      await deleteNotification.mutateAsync(id);
      toast.success('Notification supprimée');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  const typeStyles: Record<string, string> = {
    info: 'bg-blue-900/20 text-blue-400',
    succes: 'bg-green-900/20 text-green-400',
    avertissement: 'bg-yellow-900/20 text-yellow-400',
    erreur: 'bg-red-900/20 text-red-400',
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-off-white">Notifications</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowAll(!showAll)}
            className="text-sm text-acid hover:text-acid/80">
            {showAll ? 'Non lues' : 'Toutes'}
          </button>
          <button onClick={markAllAsRead}
            className="text-sm bg-[#222] text-off-white px-3 py-1 rounded hover:bg-[#333]">
            Tout marquer comme lu
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-[#222] rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`bg-[#111] p-4 rounded border border-[#222] flex items-start justify-between ${!n.est_lue ? 'border-l-4 border-acid' : ''}`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${typeStyles[n.type] || 'bg-[#222] text-muted'}`}>
                    {n.type}
                  </span>
                  {!n.est_lue && <span className="text-xs text-acid font-semibold">Nouveau</span>}
                </div>
                <p className="font-semibold text-off-white">{n.titre}</p>
                {n.message && <p className="text-sm text-muted">{n.message}</p>}
                <p className="text-xs text-muted mt-1">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {!n.est_lue && (
                  <button onClick={() => markAsRead(n.id)}
                    className="text-xs text-acid hover:text-acid/80">
                    Marquer lu
                  </button>
                )}
                <button onClick={() => setConfirmDelete(n.id)}
                  className="text-xs text-red-400 hover:text-red-300">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {notifications.length === 0 && <div className="text-center py-12"><svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-muted font-mono text-sm">Aucune notification.</p></div>}
        </div>
      )}

      <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
      <ConfirmDialog open={confirmDelete !== null} title="Supprimer la notification" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteNotification.mutateAsync(confirmDelete); toast.success('Notification supprimée'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
