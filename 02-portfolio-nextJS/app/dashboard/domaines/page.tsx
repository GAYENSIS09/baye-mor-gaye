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
import { Skeleton } from '@/components/Skeleton';
import { useToast } from '@/contexts/ToastContext';
import { Icons } from '@/components/ui/Icons';
import { CardContainer, CardContent, CardTitle } from '@/components/CardContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { ActionButton, IconButton } from '@/components/ActionBar';

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
      <SectionHeader
        title="Domaines"
        actions={
          <ActionButton variant="primary" onClick={() => {}}>
            Nouveau domaine
          </ActionButton>
        }
      />

      <CardContainer className="p-4 mb-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
          <CardTitle className="text-base">Nouveau domaine</CardTitle>
          <input id="domains-nom" {...register("nom")} placeholder="Nom" required autoComplete="off" className="input-base" />
          {errors.nom && <p className="text-red-400 text-xs mt-1">{errors.nom.message}</p>}
          <textarea id="domains-description" {...register("description")} placeholder="Description (optionnelle)" autoComplete="off" className="input-base" rows={2} />
          <div className="flex items-center gap-3">
            <input id="domains-couleur" type="color" {...register("couleur")} className="w-10 h-10 border border-[#333] rounded bg-transparent" />
            <span className="text-sm text-muted">Couleur (optionnelle)</span>
          </div>
          <ActionButton type="submit" disabled={isSubmitting} variant="primary">
            Ajouter
          </ActionButton>
        </form>
      </CardContainer>

      {isError ? (
        <div className="text-center py-16">
          <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur chargement domaines</p>
          <ActionButton variant="primary" onClick={() => refetch()}>Réessayer</ActionButton>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardContainer key={i} className="animate-pulse p-4">
              <CardContent className="p-0">
                <Skeleton className="h-16 w-full rounded" />
              </CardContent>
            </CardContainer>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {domaines.map((d) => (
            <CardContainer key={d.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {d.couleur && (
                    <span className="w-4 h-4 rounded-full inline-block shrink-0" style={{ backgroundColor: d.couleur }} />
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
                <IconButton onClick={() => setConfirmDelete(d.id)} icon={<Icons.trash className="w-4 h-4" />} label={`Supprimer ${d.nom}`} variant="danger" size="sm" />
              </div>
            </CardContainer>
          ))}
          {domaines.length === 0 && (
            <CardContainer className="p-8 text-center">
              <Icons.file className="w-10 h-10 mx-auto text-muted/30 mb-3" aria-hidden />
              <p className="text-muted font-mono text-sm">Aucun domaine.</p>
            </CardContainer>
          )}
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
