'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useContacts } from '@/hooks/queries';
import { useReadContact, useDeleteContact } from '@/hooks/mutations';
import { useToast } from '@/contexts/ToastContext';
import Pagination from '@/components/Pagination';
import ConfirmDialog from '@/components/ConfirmDialog';
import { LoadingScreen } from '@/components/LoadingScreen';

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-off-white">Messages recus</h1>
        <button onClick={() => setFilterNonLus(!filterNonLus)}
          className={`text-sm px-3 py-1 rounded font-mono text-xs uppercase tracking-widest ${filterNonLus ? 'bg-acid text-black' : 'bg-[#222] text-off-white'}`}>
          Non lus seulement
        </button>
      </div>

      {isError ? (
        <div className="text-center py-16">
          <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur chargement contacts</p>
          <button onClick={() => refetch()} className="bg-acid text-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-acid/90 transition-colors rounded">
            Réessayer
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-[#222] rounded animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {contacts.map((c) => (
              <button key={c.id} onClick={() => setSelected(c)}
                className={`w-full text-left bg-[#111] p-4 rounded border border-[#222] hover:border-acid/30 transition ${!c.est_lu ? 'border-l-4 border-acid' : ''} ${selected?.id === c.id ? 'ring-2 ring-acid' : ''}`}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold truncate text-off-white">{c.nom}</p>
                  {!c.est_lu && <span className="w-2 h-2 bg-acid rounded-full" />}
                </div>
                <p className="text-sm text-muted truncate">{c.email}</p>
                {c.sujet && <p className="text-sm text-muted truncate">{c.sujet}</p>}
                <p className="text-xs text-muted mt-1">{new Date(c.created_at).toLocaleString('fr-FR')}</p>
              </button>
            ))}
            {contacts.length === 0 && <div className="text-center py-12"><svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-muted font-mono text-sm">Aucun message.</p></div>}
          </div>

          <div>
            {selected ? (
              <div className="bg-[#111] p-6 rounded border border-[#222]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-off-white">{selected.nom}</h2>
                    <a href={`mailto:${selected.email}`} className="text-acid hover:underline text-sm">
                      {selected.email}
                    </a>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded ${selected.est_lu ? 'bg-[#222] text-muted' : 'bg-acid/10 text-acid'}`}>
                    {selected.est_lu ? 'Lu' : 'Non lu'}
                  </span>
                </div>
                {selected.sujet && (
                  <p className="text-sm font-semibold text-off-white mb-2">Sujet : {selected.sujet}</p>
                )}
                <p className="text-off-white whitespace-pre-wrap mb-4">{selected.message}</p>
                <p className="text-xs text-muted mb-4">
                  Recu le {new Date(selected.created_at).toLocaleString('fr-FR')}
                </p>
                <div className="flex gap-2">
                  {!selected.est_lu && (
                    <button onClick={() => markAsRead(selected.id)}
                      className="bg-acid text-black px-4 py-2 rounded text-sm font-mono text-xs uppercase tracking-widest hover:bg-acid/90">
                      Marquer comme lu
                    </button>
                  )}
                  <button onClick={() => setConfirmDelete(selected.id)}
                    className="bg-red-900/20 text-red-400 px-4 py-2 rounded text-sm font-mono text-xs uppercase tracking-widest hover:bg-red-900/40">
                    Supprimer
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#0A0A0A] p-6 rounded border border-[#222] text-center text-muted">
                Selectionnez un message pour le lire
              </div>
            )}
          </div>
        </div>
      )}

      <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
      <ConfirmDialog open={confirmDelete !== null} title="Supprimer le message" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteContactMutation.mutateAsync(confirmDelete); setSelected(null); } catch { console.error('Erreur'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
