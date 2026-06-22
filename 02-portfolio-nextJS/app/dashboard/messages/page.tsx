'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useContacts } from '@/hooks/queries';
import { useReadContact, useDeleteContact } from '@/hooks/mutations';
import { useToast } from '@/contexts/ToastContext';
import { Pagination } from '@/components/ActionBar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Icons } from '@/components/ui/Icons';
import { CardContainer, CardTitle } from '@/components/CardContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { ListGrid } from '@/components/ResponsiveGrid';
import { ActionButton, ActionBar, IconButton, StatusBadge } from '@/components/ActionBar';

export default function ContactsDashboardPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const [selected, setSelected] = useState<{ id: number; nom: string; email: string; sujet: string | null; message: string; est_lu: boolean; created_at: string } | null>(null);
  const [filterNonLus, setFilterNonLus] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const params: Record<string, string> = { page: String(currentPage) };
  if (filterNonLus) params.est_lu = 'false';
  const { data: contactsResponse, isLoading, isError, refetch } = useContacts(params);
  const contacts = contactsResponse?.data ?? [];
  const lastPage = contactsResponse?.last_page ?? 1;
  const total = contactsResponse?.total ?? 0;
  const readContact = useReadContact();
  const deleteContactMutation = useDeleteContact();
  const toast = useToast();

  async function markAsRead(id: number) {
    try {
      await readContact.mutateAsync(id);
      toast.success('Message marqué comme lu');
      if (selected?.id === id) {
        setSelected({ ...selected, est_lu: true });
      }
    } catch {
      toast.error('Erreur lors du marquage');
    }
  }

  async function handleDeleteContact(id: number) {
    try {
      await deleteContactMutation.mutateAsync(id);
      toast.success('Message supprimé');
      if (selected?.id === id) setSelected(null);
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <SectionHeader
        title="Messages reçus"
        actions={
          <ActionButton
            variant={filterNonLus ? 'primary' : 'secondary'}
            onClick={() => setFilterNonLus(!filterNonLus)}
          >
            Non lus seulement
          </ActionButton>
        }
      />

      {isError ? (
        <div className="text-center py-16">
          <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur chargement contacts</p>
          <ActionButton variant="primary" onClick={() => refetch()}>Réessayer</ActionButton>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-[#222] rounded animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ListGrid gap={3}>
            {contacts.map((c) => (
              <button key={c.id} onClick={() => setSelected(c)}
                className={`w-full text-left bg-[#111] p-4 rounded border border-[#222] hover:border-acid/30 transition ${!c.est_lu ? 'border-l-4 border-acid' : ''} ${selected?.id === c.id ? 'ring-2 ring-acid' : ''}`}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold truncate text-off-white">{c.nom}</p>
                  {!c.est_lu && <span className="w-2 h-2 bg-acid rounded-full shrink-0" />}
                </div>
                <p className="text-sm text-muted truncate">{c.email}</p>
                {c.sujet && <p className="text-sm text-muted truncate">{c.sujet}</p>}
                <p className="text-xs text-muted mt-1">{new Date(c.created_at).toLocaleString('fr-FR')}</p>
              </button>
            ))}
            {contacts.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-muted font-mono text-sm">Aucun message.</p>
              </div>
            )}
          </ListGrid>

          <div>
            {selected ? (
              <CardContainer className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <CardTitle className="text-xl">{selected.nom}</CardTitle>
                    <a href={`mailto:${selected.email}`} className="text-acid hover:underline text-sm">
                      {selected.email}
                    </a>
                  </div>
                  <StatusBadge variant={selected.est_lu ? 'default' : 'info'} size="sm">
                    {selected.est_lu ? 'Lu' : 'Non lu'}
                  </StatusBadge>
                </div>
                {selected.sujet && (
                  <p className="text-sm font-semibold text-off-white mb-2">Sujet : {selected.sujet}</p>
                )}
                <p className="text-off-white whitespace-pre-wrap mb-4">{selected.message}</p>
                <p className="text-xs text-muted mb-4">
                  Reçu le {new Date(selected.created_at).toLocaleString('fr-FR')}
                </p>
                <ActionBar align="start" gap={2}>
                  {!selected.est_lu && (
                    <ActionButton variant="primary" onClick={() => markAsRead(selected.id)}>
                      Marquer comme lu
                    </ActionButton>
                  )}
                  <IconButton onClick={() => setConfirmDelete(selected.id)} icon={<Icons.trash className="w-4 h-4" />} label="Supprimer" variant="danger" />
                </ActionBar>
              </CardContainer>
            ) : (
              <div className="bg-[#0A0A0A] p-6 rounded border border-[#222] text-center text-muted">
                Sélectionnez un message pour le lire
              </div>
            )}
          </div>
        </div>
      )}

      <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
      <ConfirmDialog open={confirmDelete !== null} title="Supprimer le message" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteContactMutation.mutateAsync(confirmDelete); setSelected(null); toast.success('Message supprimé'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}