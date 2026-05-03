'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useRappels } from '@/hooks/queries';
import { useCreateRappel, useDeleteRappel, useUpdateRappel } from '@/hooks/mutations';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { Rappel } from '@/types/api';
import { LoadingScreen } from '@/components/LoadingScreen';

function formatDatetimeLocal(date: string | null) {
  if (!date) return '';
  try { return new Date(date).toISOString().slice(0, 16); } catch { return ''; }
}

export default function RappelsDashboardPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const { data: rappelsRes, isLoading, refetch } = useRappels();
  const rappels = rappelsRes?.data ?? [];
  const createRappel = useCreateRappel();
  const deleteRappel = useDeleteRappel();
  const updateRappel = useUpdateRappel();
  const [showForm, setShowForm] = useState(false);
  const [titre, setTitre] = useState('');
  const [message, setMessage] = useState('');
  const [notifieLe, setNotifieLe] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitre, setEditTitre] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editNotifieLe, setEditNotifieLe] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { titre, message: message || undefined };
      if (notifieLe) payload.notifie_le = new Date(notifieLe).toISOString();
      await createRappel.mutateAsync(payload);
      setTitre('');
      setMessage('');
      setNotifieLe('');
      setShowForm(false);
    } catch {
      console.error('Erreur création');
    } finally { setSaving(false); }
  }

  function startEdit(r: Rappel) {
    setEditingId(r.id);
    setEditTitre(r.titre);
    setEditMessage(r.message || '');
    setEditNotifieLe(formatDatetimeLocal(r.notifie_le));
  }

  async function saveEdit() {
    if (!editingId) return;
    try {
      const payload: Record<string, unknown> = { titre: editTitre, message: editMessage || undefined };
      if (editNotifieLe) payload.notifie_le = new Date(editNotifieLe).toISOString();
      await updateRappel.mutateAsync({ id: editingId, ...payload });
      setEditingId(null);
    } catch {
      console.error('Erreur mise à jour');
    }
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-off-white">Rappels</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 font-mono text-xs uppercase tracking-widest">
          {showForm ? 'Annuler' : 'Nouveau rappel'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#111] p-4 rounded border border-[#222] mb-6 space-y-3">
          <input name="titre" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre" required autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          <textarea name="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" rows={3} />
          <div>
            <label htmlFor="rappel-notifie" className="block text-sm text-muted mb-1">Rappeler le</label>
            <input id="rappel-notifie" type="datetime-local" value={notifieLe} onChange={(e) => setNotifieLe(e.target.value)}
              className="w-full border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          </div>
          <button type="submit" disabled={saving} className="bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest">
            {saving ? 'Création...' : 'Créer'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-[#222] rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {rappels.map((r) => {
            const isEditing = editingId === r.id;
            return (
              <div key={r.id} className="bg-[#111] p-4 rounded border border-[#222] flex items-start justify-between">
                {isEditing ? (
                  <div className="flex-1 space-y-2">
                    <input value={editTitre} onChange={(e) => setEditTitre(e.target.value)}
                      className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
                    <textarea value={editMessage} onChange={(e) => setEditMessage(e.target.value)}
                      className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" rows={2} />
                    <input type="datetime-local" value={editNotifieLe} onChange={(e) => setEditNotifieLe(e.target.value)}
                      className="w-full border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="text-xs text-acid font-mono hover:text-acid/80 transition-colors">Sauver</button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-muted font-mono hover:text-off-white transition-colors">Annuler</button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-off-white">{r.titre}</p>
                      {r.est_notifie && <span className="text-xs bg-green-900/20 text-green-400 px-2 py-0.5 rounded">Notifié</span>}
                    </div>
                    {r.message && <p className="text-sm text-muted">{r.message}</p>}
                    <p className="text-xs text-muted mt-1">
                      Créé le {new Date(r.created_at).toLocaleDateString('fr-FR')}
                      {r.notifie_le && ` — Rappel le ${new Date(r.notifie_le).toLocaleDateString('fr-FR')} ${new Date(r.notifie_le).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  {!isEditing && (
                    <>
                      <button onClick={() => startEdit(r)} className="text-xs text-muted hover:text-off-white font-mono transition-colors">Modifier</button>
                      <button onClick={() => setConfirmDelete(r.id)} className="text-xs text-red-400 hover:text-red-300 font-mono transition-colors">Supprimer</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {rappels.length === 0 && <div className="text-center py-12"><svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-muted font-mono text-sm">Aucun rappel.</p></div>}
        </div>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer le rappel" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { await deleteRappel.mutateAsync(confirmDelete); setConfirmDelete(null); refetch(); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
