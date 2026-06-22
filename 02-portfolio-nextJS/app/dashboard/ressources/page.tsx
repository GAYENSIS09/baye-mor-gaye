'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RessourceFormSchema, type RessourceFormData } from '@/schemas/forms';
import { useRessources, useDomaines } from '@/hooks/queries';
import { useCreateRessource, useUpdateRessource, useDeleteRessource, useCreateRessourceMedia, useDeleteRessourceMedia } from '@/hooks/mutations';
import { uploadFile, uploadImage } from '@/lib/upload';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Skeleton } from '@/components/Skeleton';
import { Pagination } from '@/components/ActionBar';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import Image from 'next/image';
import { Icons } from '@/components/ui/Icons';
import { CardContainer, CardContent, CardTitle } from '@/components/CardContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { ActionButton, IconButton } from '@/components/ActionBar';

const STORAGE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '/storage') || 'http://localhost:8000/storage';

const MEDIA_TYPE_LABELS: Record<string, string> = {
  image: 'Image',
  video: 'Vidéo',
  document: 'Document',
  lien: 'Lien',
  youtube: 'YouTube',
};

const MEDIA_TYPE_ICONS: Record<string, React.ReactNode> = {
  image: <Icons.file className="w-4 h-4" aria-hidden />,
  video: <Icons.play className="w-4 h-4" aria-hidden />,
  document: <Icons.file className="w-4 h-4" aria-hidden />,
  lien: <Icons.external className="w-4 h-4" aria-hidden />,
  youtube: <Icons.play className="w-4 h-4" aria-hidden />,
};

function getMediaUrlFromPath(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${STORAGE_URL}/${path.replace(/^\//, '')}`;
}

function typeIcon(type: string): React.ReactNode {
  return MEDIA_TYPE_ICONS[type] || <Icons.file className="w-4 h-4" aria-hidden />;
}

export default function RessourcesDashboardPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const params: Record<string, string> = { page: String(currentPage) };
  const { data: ressourcesRes, isLoading, isError, refetch } = useRessources(params);
  const ressources = ressourcesRes?.data ?? [];
  const lastPage = ressourcesRes?.last_page ?? 1;
  const total = ressourcesRes?.total ?? 0;
  const { data: domaines = [] } = useDomaines();
  const createRessource = useCreateRessource();
  const updateRessource = useUpdateRessource();
  const deleteRessource = useDeleteRessource();
  const createMedia = useCreateRessourceMedia();
  const deleteMedia = useDeleteRessourceMedia();

  const [editingRessource, setEditingRessource] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmDeleteMedia, setConfirmDeleteMedia] = useState<number | null>(null);

  const editingData = editingRessource
    ? ressources.find(r => r.id === editingRessource) ?? null
    : null;

  const toast = useToast();

  const form = useForm<RessourceFormData>({
    resolver: zodResolver(RessourceFormSchema),
    defaultValues: { titre: '', domaine_id: undefined },
  });

  function resetForm() {
    form.reset({ titre: '', description: '', domaine_id: undefined });
    setEditingRessource(null);
    setShowCreateForm(false);
  }

  function startEdit(r: NonNullable<typeof editingData>) {
    setEditingRessource(r.id);
    form.reset({
      titre: r.titre,
      description: r.description || '',
      domaine_id: r.domaine?.id ?? undefined,
    });
  }

  async function onSubmit(data: RessourceFormData) {
    try {
      if (editingRessource) {
        await updateRessource.mutateAsync({ id: editingRessource, ...data });
        toast.success('Ressource modifiée');
        resetForm();
      } else {
        const res = await createRessource.mutateAsync({
          titre: data.titre,
          description: data.description || undefined,
          domaine_id: data.domaine_id || undefined,
          est_publique: data.est_publique ?? true,
        });
        const ressourceId = (res as { id?: number })?.id ?? (res as { data?: { id?: number } })?.data?.id;
        if (!ressourceId) throw new Error('No ID returned');

        toast.success('Ressource ajoutée');
        resetForm();
      }
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    }
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editingRessource) return;

    try {
      const isImage = file.type.startsWith('image/');
      const uploaded = isImage ? await uploadImage(file, 'ressources') : await uploadFile(file, 'ressources');
      const type = isImage ? 'image' : file.type === 'application/pdf' ? 'document' : 'document';
      const titre = 'name' in uploaded ? uploaded.name : file.name;

      await createMedia.mutateAsync({
        mediable_type: 'App\\Models\\Ressource',
        mediable_id: editingRessource,
        type,
        chemin_fichier: uploaded.path,
        titre: titre || file.name,
      });

      toast.success('Fichier ajouté');
    } catch {
      toast.error("Erreur lors de l'upload");
    }

    e.target.value = '';
  }

  async function handleDeleteMedia(mediaId: number) {
    try {
      await deleteMedia.mutateAsync(mediaId);
      toast.success('Média supprimé');
      setConfirmDeleteMedia(null);
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <SectionHeader
        title="Ressources"
        actions={
          <ActionButton variant="primary" onClick={() => { if (editingRessource) resetForm(); else setShowCreateForm(!showCreateForm); }}>
            {showCreateForm || editingRessource ? 'Annuler' : 'Nouvelle ressource'}
          </ActionButton>
        }
      />

      {(editingRessource || showCreateForm) && (
        <CardContainer className="p-4 mb-6">
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono text-muted uppercase tracking-wider">
                {editingRessource ? 'Modifier la ressource' : 'Nouvelle ressource'}
              </h3>
              {editingRessource && (
                <button type="button" onClick={resetForm} className="text-xs text-muted hover:text-off-white transition-colors font-mono">
                  Annuler
                </button>
              )}
            </div>
            <div>
              <input {...form.register("titre")} placeholder="Titre" required autoComplete="off"
                className="input-base" />
              {form.formState.errors.titre && <p className="text-red-400 text-xs mt-1">{form.formState.errors.titre.message}</p>}
            </div>
            <div>
              <textarea {...form.register("description")} placeholder="Description" rows={3}
                className="input-base resize-none" />
            </div>
            <div>
              <select {...form.register("domaine_id")}
                className="w-full border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50">
                <option value="">Sans domaine</option>
                {domaines.map((d) => (
                  <option key={d.id} value={d.id}>{d.nom}</option>
                ))}
              </select>
            </div>
            <ActionButton type="submit" disabled={form.formState.isSubmitting} variant="primary">
              {form.formState.isSubmitting ? 'Enregistrement...' : editingRessource ? 'Enregistrer' : 'Ajouter'}
            </ActionButton>
          </form>
        </CardContainer>
      )}

      {isError ? (
        <div className="text-center py-16">
          <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur chargement ressources</p>
          <ActionButton variant="primary" onClick={() => refetch()}>Réessayer</ActionButton>
        </div>
      ) : isLoading ? (
        <ResponsiveGrid columns={1} gap={3}>
          {Array.from({ length: 3 }).map((_, i) => (
            <CardContainer key={i} className="animate-pulse p-4">
              <CardContent className="p-0">
                <Skeleton className="h-16 w-full rounded" />
              </CardContent>
            </CardContainer>
          ))}
        </ResponsiveGrid>
      ) : (
        <>
          <ResponsiveGrid columns={1} gap={3}>
            {ressources.map((r) => {
              const imageMedia = r.medias?.find(m => m.type === 'image');
              const cover = imageMedia ? getMediaUrlFromPath(imageMedia.chemin_fichier) : null;
              const fileMedias = r.medias?.filter(m => m.type !== 'image') ?? [];
              return (
                <div key={r.id}>
                  <CardContainer hover className="p-4">
                    <div className="flex items-start gap-4">
                      {cover ? (
                        <div className="w-16 h-12 rounded overflow-hidden bg-[#222] shrink-0 relative">
                          <Image src={cover} alt="" fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-16 h-12 rounded bg-[#222] flex items-center justify-center shrink-0">
                          <Icons.file className="w-5 h-5 text-muted" aria-hidden />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-off-white truncate">{r.titre}</span>
                          {r.domaine && (
                            <Link href="/dashboard/domaines" className="text-xs bg-acid/10 text-acid px-2 py-0.5 rounded hover:bg-acid/20 transition-colors shrink-0">
                              {r.domaine.nom}
                            </Link>
                          )}
                        </div>
                        {r.description && (
                          <p className="text-sm text-muted truncate mt-0.5">{r.description}</p>
                        )}
                        {(r.medias && r.medias.length > 0) && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {r.medias.map(m => (
                              <span key={m.id} className="inline-flex items-center gap-1 text-[10px] font-mono text-muted bg-[#1a1a1a] px-1.5 py-0.5 rounded">
                                {typeIcon(m.type)}
                                {MEDIA_TYPE_LABELS[m.type] || m.type}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <IconButton
                          onClick={() => startEdit(r)}
                          icon={<Icons.edit className="w-4 h-4" />}
                          label={`Modifier ${r.titre}`}
                          variant="ghost"
                          size="sm"
                        />
                        <IconButton
                          onClick={() => setConfirmDelete(r.id)}
                          icon={<Icons.trash className="w-4 h-4" />}
                          label={`Supprimer ${r.titre}`}
                          variant="danger"
                          size="sm"
                        />
                      </div>
                    </div>
                  </CardContainer>

                  {editingRessource === r.id && (
                    <CardContainer className="mt-2 p-4 border-acid/30">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-mono text-muted uppercase tracking-wider">Médias attachés</h4>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-acid hover:text-acid/80 transition-colors font-mono">
                          <Icons.plus className="w-3.5 h-3.5" aria-hidden />
                          Ajouter un fichier
                          <input type="file" onChange={handleMediaUpload} className="hidden" />
                        </label>
                      </div>
                      {(!r.medias || r.medias.length === 0) ? (
                        <p className="text-xs text-muted font-mono text-center py-4">Aucun média. Ajoutez un fichier (PDF, image, vidéo...)</p>
                      ) : (
                        <div className="space-y-2">
                          {r.medias.map(m => {
                            const url = getMediaUrlFromPath(m.chemin_fichier);
                            return (
                              <div key={m.id} className="flex items-center gap-3 bg-[#0A0A0A] rounded p-2">
                                <div className="w-10 h-10 rounded overflow-hidden bg-[#222] shrink-0 flex items-center justify-center">
                                  {m.type === 'image' && url ? (
                                    <Image src={url} alt="" width={40} height={40} className="object-cover w-full h-full" unoptimized />
                                  ) : (
                                    <span className="text-muted">{typeIcon(m.type)}</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-off-white truncate">{m.titre || 'Sans titre'}</p>
                                  <p className="text-[10px] text-muted font-mono">{MEDIA_TYPE_LABELS[m.type] || m.type}{m.est_principal ? ' • Principal' : ''}</p>
                                </div>
                                <IconButton
                                  onClick={() => setConfirmDeleteMedia(m.id)}
                                  icon={<Icons.trash className="w-3.5 h-3.5" />}
                                  label="Supprimer ce média"
                                  variant="danger"
                                  size="sm"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContainer>
                  )}
                </div>
              );
            })}
          </ResponsiveGrid>

          {ressources.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-muted font-mono text-sm">Aucune ressource.</p>
            </div>
          )}

          <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
        </>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer la ressource" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteRessource.mutateAsync(confirmDelete); toast.success('Ressource supprimée'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />

      <ConfirmDialog open={confirmDeleteMedia !== null} title="Supprimer le média" message="Ce fichier sera définitivement supprimé." destructive confirmLabel="Supprimer" onConfirm={() => { if (confirmDeleteMedia) handleDeleteMedia(confirmDeleteMedia); } } onCancel={() => setConfirmDeleteMedia(null)} />
    </div>
  );
}
