'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RappelFormSchema, type RappelFormData } from '@/schemas/forms';
import { useRappels } from '@/hooks/queries';
import { useCreateRappel, useDeleteRappel, useUpdateRappel } from '@/hooks/mutations';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { Rappel } from '@/types/api';
import { LoadingScreen } from '@/components/LoadingScreen';
import { SectionHeader } from '@/components/SectionHeader';
import { CardContainer, CardTitle, CardDescription, CardActions } from '@/components/CardContainer';
import { ActionButton, ActionBar, StatusBadge } from '@/components/ActionBar';
import { Icons } from '@/components/ui/Icons';

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
  const [notifieLe, setNotifieLe] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitre, setEditTitre] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editNotifieLe, setEditNotifieLe] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RappelFormData>({
    resolver: zodResolver(RappelFormSchema),
    defaultValues: { titre: '', message: '' },
  });

  async function handleCreate(data: RappelFormData) {
    try {
      const payload: Record<string, unknown> = { ...data, message: data.message || undefined };
      if (notifieLe) payload.notifie_le = new Date(notifieLe).toISOString();
      await createRappel.mutateAsync(payload);
      reset({ titre: '', message: '' });
      setNotifieLe('');
      setShowForm(false);
    } catch {
      console.error('Erreur création');
    }
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
      <SectionHeader
        title="Rappels"
        actions={
          <ActionButton variant={showForm ? 'secondary' : 'primary'} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : 'Nouveau rappel'}
          </ActionButton>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit(handleCreate)} noValidate className="w-full bg-[#111] p-4 rounded border border-[#222] mb-6 space-y-3">
          <div>
            <input {...register("titre")} placeholder="Titre" required autoComplete="off"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            {errors.titre && <p className="text-red-400 text-xs mt-1">{errors.titre.message}</p>}
          </div>
          <div>
            <textarea {...register("message")} placeholder="Message" autoComplete="off"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" rows={3} />
          </div>
          <div>
            <label htmlFor="rappel-notifie" className="block text-sm text-muted mb-1">Rappeler le</label>
            <input id="rappel-notifie" type="datetime-local" value={notifieLe} onChange={(e) => setNotifieLe(e.target.value)}
              className="w-full border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          </div>
          <ActionButton type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer'}
          </ActionButton>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-[#222] rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {rappels.map((r) => {
            const isEditing = editingId === r.id;
            return (
              <CardContainer key={r.id} className="p-4">
                {isEditing ? (
                  <div className="flex-1 space-y-2">
                    <input value={editTitre} onChange={(e) => setEditTitre(e.target.value)}
                      className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
                    <textarea value={editMessage} onChange={(e) => setEditMessage(e.target.value)}
                      className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" rows={2} />
                    <input type="datetime-local" value={editNotifieLe} onChange={(e) => setEditNotifieLe(e.target.value)}
                      className="w-full border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
                    <ActionBar align="start" gap={2}>
                      <ActionButton variant="primary" size="sm" onClick={saveEdit}>Sauver</ActionButton>
                      <ActionButton variant="ghost" size="sm" onClick={() => setEditingId(null)}>Annuler</ActionButton>
                    </ActionBar>
                  </div>
                ) : (
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base">{r.titre}</CardTitle>
                        {r.est_notifie && <StatusBadge variant="success" size="sm">Notifié</StatusBadge>}
                      </div>
                      {r.message && <CardDescription className="mt-1">{r.message}</CardDescription>}
                      <p className="text-xs text-muted mt-1">
                        Créé le {new Date(r.created_at).toLocaleDateString('fr-FR')}
                        {r.notifie_le && ` — Rappel le ${new Date(r.notifie_le).toLocaleDateString('fr-FR')} ${new Date(r.notifie_le).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                      </p>
                    </div>
                    <CardActions className="mt-0 pt-0 border-0 shrink-0">
                      <ActionButton variant="ghost" size="sm" onClick={() => startEdit(r)}>Modifier</ActionButton>
                      <ActionButton variant="danger" size="sm" onClick={() => setConfirmDelete(r.id)}>
                        <Icons.trash className="w-4 h-4" />
                      </ActionButton>
                    </CardActions>
                  </div>
                )}
              </CardContainer>
            );
          })}
          {rappels.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-muted font-mono text-sm">Aucun rappel.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer le rappel" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { await deleteRappel.mutateAsync(confirmDelete); setConfirmDelete(null); refetch(); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}