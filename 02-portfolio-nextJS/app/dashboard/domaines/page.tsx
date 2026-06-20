'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DomaineFormSchema, type DomaineFormData } from '@/schemas/forms';
import { useState, useRef, useEffect } from 'react';
import { useDomaines } from '@/hooks/queries';
import { useCreateDomaine, useUpdateDomaine, useDeleteDomaine } from '@/hooks/mutations';
import type { Domaine } from '@/types/api';
import ConfirmDialog from '@/components/ConfirmDialog';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useToast } from '@/contexts/ToastContext';
import { Icons } from '@/components/ui/Icons';

export default function DomainsPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const { data: domaines = [], isLoading, isError, refetch } = useDomaines();
  const createDomaine = useCreateDomaine();
  const updateDomaine = useUpdateDomaine();
  const deleteDomaine = useDeleteDomaine();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const editRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  async function saveEdit(id: number) {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    try {
      await updateDomaine.mutateAsync({ id, nom: trimmed });
      toast.success('Domaine mis à jour');
      setEditingId(null);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  function startEdit(d: Domaine) {
    setEditingId(d.id);
    setEditValue(d.nom);
  }

  useEffect(() => {
    if (editingId !== null) editRef.current?.focus();
  }, [editingId]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<DomaineFormData>({
    resolver: zodResolver(DomaineFormSchema),
    defaultValues: {
      nom: '',
      description: '',
      couleur: '#AAFF00',
    },
  });

  async function onSubmit(data: DomaineFormData) {
    try {
      await createDomaine.mutateAsync(data);
      reset({ nom: '', description: '', couleur: '#AAFF00' });
      toast.success('Domaine ajouté');
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-off-white">Domaines</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-[#111] p-4 rounded border border-[#222] mb-6 space-y-3">
        <h2 className="font-semibold text-off-white">Nouveau domaine</h2>
        <label htmlFor="domains-nom" className="sr-only">Nom</label>
        <input id="domains-nom" {...register("nom")} placeholder="Nom" required autoComplete="off"
          className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        {errors.nom && <p className="text-red-400 text-xs mt-1">{errors.nom.message}</p>}
        <label htmlFor="domains-description" className="sr-only">Description</label>
        <textarea id="domains-description" {...register("description")} placeholder="Description (optionnelle)" autoComplete="off"
          className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" rows={2} />
        <div className="flex items-center gap-3">
          <label htmlFor="domains-couleur" className="sr-only">Couleur</label>
          <input id="domains-couleur" type="color" {...register("couleur")}
            className="w-10 h-10 border border-[#333] rounded bg-transparent" />
          <span className="text-sm text-muted">Couleur (optionnelle)</span>
        </div>
        <button type="submit" disabled={isSubmitting} className="bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest">
          Ajouter
        </button>
      </form>

      {isError ? (
        <div className="text-center py-16">
          <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur chargement domaines</p>
          <button onClick={() => refetch()} className="bg-acid text-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-acid/90 transition-colors rounded">
            Réessayer
          </button>
        </div>
      ) : isLoading ? (
        <p className="text-muted">Chargement...</p>
      ) : (
        <div className="space-y-3">
          {domaines.map((d) => (
            <div key={d.id} className="bg-[#111] p-4 rounded border border-[#222] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {d.couleur && (
                  <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: d.couleur }} />
                )}
                <div>
                  {editingId === d.id ? (
                    <input ref={editRef} value={editValue} onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => saveEdit(d.id)} onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(d.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="font-semibold bg-transparent border border-acid/50 rounded px-2 py-0.5 text-off-white w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
                  ) : (
                    <button onClick={() => startEdit(d)} className="font-semibold text-off-white hover:text-acid transition-colors text-left">
                      {d.nom}
                    </button>
                  )}
                  <p className="text-sm text-muted">{d.slug}</p>
                  {d.description && <p className="text-sm text-muted">{d.description}</p>}
                </div>
              </div>
              <button onClick={() => setConfirmDelete(d.id)} aria-label={`Supprimer ${d.nom}`}
                className="p-2 text-red-400 hover:text-red-300 transition-colors rounded hover:bg-red-400/10">
                <Icons.trash className="w-4 h-4" />
              </button>
            </div>
          ))}
          {domaines.length === 0 && <div className="text-center py-12"><svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-muted font-mono text-sm">Aucun domaine.</p></div>}
        </div>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer le domaine" message="Les publications liées seront dissociées, les ressources perdront leur référence." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteDomaine.mutateAsync(confirmDelete); toast.success('Domaine supprimé'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)}>
        {confirmDelete && (() => {
          const d = domaines.find((x) => x.id === confirmDelete);
          if (!d) return null;
          return (
            <div className="bg-[#1a1a1a] rounded p-3 mb-4 space-y-1 text-sm">
              <p className="text-muted"><span className="text-off-white font-semibold">{d.publications_count ?? 0}</span> publication(s) liée(s)</p>
              <p className="text-muted"><span className="text-off-white font-semibold">{d.ressources_count ?? 0}</span> ressource(s) liée(s)</p>
            </div>
          );
        })()}
      </ConfirmDialog>
    </div>
  );
}
