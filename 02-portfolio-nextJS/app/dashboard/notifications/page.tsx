'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useNotifications } from '@/hooks/queries';
import { useReadNotification, useReadAllNotifications, useDeleteNotification } from '@/hooks/mutations';
import { useToast } from '@/contexts/ToastContext';
import { Pagination } from '@/components/ActionBar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Icons } from '@/components/ui/Icons';
import { CardContainer, CardContent, CardTitle, CardDescription, CardActions } from '@/components/CardContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { ListGrid } from '@/components/ResponsiveGrid';
import { ActionButton, IconButton, StatusBadge } from '@/components/ActionBar';

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
      <SectionHeader
        title="Notifications"
        actions={
          <div className="flex gap-2 flex-wrap">
            <ActionButton variant="ghost" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Non lues' : 'Toutes'}
            </ActionButton>
            <ActionButton variant="secondary" onClick={markAllAsRead}>
              Tout marquer comme lu
            </ActionButton>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-[#222] rounded animate-pulse" />)}</div>
      ) : (
        <ListGrid gap={3}>
          {notifications.map((n) => (
            <CardContainer
              key={n.id}
              className={`p-4 ${!n.est_lue ? 'ring-1 ring-acid/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <CardContent className="p-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge variant={
                      n.type === 'info' ? 'info' :
                      n.type === 'succes' ? 'success' :
                      n.type === 'avertissement' ? 'warning' :
                      n.type === 'erreur' ? 'danger' : 'default'
                    } size="sm">
                      {n.type}
                    </StatusBadge>
                    {!n.est_lue && <span className="text-xs text-acid font-semibold">Nouveau</span>}
                  </div>
                  <CardTitle className="text-base">{n.titre}</CardTitle>
                  {n.message && <CardDescription className="text-sm">{n.message}</CardDescription>}
                  <p className="text-xs text-muted mt-1">{new Date(n.created_at).toLocaleString('fr-FR')}</p>
                </CardContent>
                <CardActions className="mt-0 pt-0 border-0 shrink-0">
                  {!n.est_lue && (
                    <ActionButton variant="ghost" size="sm" onClick={() => markAsRead(n.id)}>
                      Marquer lu
                    </ActionButton>
                  )}
                  <IconButton onClick={() => setConfirmDelete(n.id)} icon={<Icons.trash className="w-4 h-4" />} label="Supprimer" variant="danger" size="sm" />
                </CardActions>
              </div>
            </CardContainer>
          ))}
          {notifications.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-muted font-mono text-sm">Aucune notification.</p>
            </div>
          )}
        </ListGrid>
      )}

      <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
      <ConfirmDialog open={confirmDelete !== null} title="Supprimer la notification" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteNotification.mutateAsync(confirmDelete); toast.success('Notification supprimée'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}