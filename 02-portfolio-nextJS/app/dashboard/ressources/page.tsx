'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef } from 'react';
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
import { getMediaUrl } from '@/lib/media';

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

function typeIcon(type: string): React.ReactNode {
  return MEDIA_TYPE_ICONS[type] || <Icons.file className="w-4 h-4" aria-hidden />;
}

export default function RessourcesDashboardPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [domaineFilter, setDomaineFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const params: Record<string, string> = { page: String(currentPage) };
  if (search) params.search = search;
  if (domaineFilter) params.domaine = domaineFilter;
  if (typeFilter) params.type = typeFilter;
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
  const [viewMedia, setViewMedia] = useState<{ url: string; titre?: string } | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaLink, setMediaLink] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editingData = editingRessource
    ? ressources.find(r => r.id === editingRessource) ?? null
    : null;

  const toast = useToast();

  const form = useForm<RessourceFormData>({
    resolver: zodResolver(RessourceFormSchema) as any,
    defaultValues: { titre: '', domaine_id: undefined, est_publique: true },
  });

  function resetForm() {
    form.reset({ titre: '', description: '', domaine_id: undefined, est_publique: true });
    setEditingRessource(null);
    setShowCreateForm(false);
    setMediaFile(null);
    setMediaPreview('');
    setMediaLink('');
  }

  function handleMediaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setMediaFile(f);
    const reader = new FileReader();
    reader.onload = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(f);
  }

  function startEdit(r: NonNullable<typeof editingData>) {
    setEditingRessource(r.id);
    form.reset({
      titre: r.titre,
      description: r.description || '',
      domaine_id: r.domaine?.id ?? undefined,
      est_publique: r.est_publique ?? true,
    });
  }

  async function onSubmit(data: RessourceFormData) {
    try {
      if (editingRessource) {
        await updateRessource.mutateAsync({
          id: editingRessource,
          titre: data.titre,
          description: data.description || undefined,
          domaine_id: data.domaine_id || undefined,
          est_publique: data.est_publique ?? true,
        });
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

        if (mediaFile) {
          const isImage = mediaFile.type.startsWith('image/');
          const uploaded = isImage ? await uploadImage(mediaFile, 'ressources') : await uploadFile(mediaFile, 'ressources');
          const type = isImage ? 'image' : mediaFile.type === 'application/pdf' ? 'document' : 'document';
          const titre = 'name' in uploaded ? uploaded.name : mediaFile.name;
          await createMedia.mutateAsync({
            mediable_type: 'App\\Models\\Ressource',
            mediable_id: ressourceId,
            type,
            chemin_fichier: uploaded.path,
            titre: titre || mediaFile.name,
          });
        }

        if (mediaLink) {
          const isYoutube = mediaLink.includes('youtube.com') || mediaLink.includes('youtu.be');
          await createMedia.mutateAsync({
            mediable_type: 'App\\Models\\Ressource',
            mediable_id: ressourceId,
            type: isYoutube ? 'youtube' : 'lien',
            chemin_fichier: mediaLink,
            titre: mediaLink,
          });
        }

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

  async function handleAddLink(url: string) {
    if (!url || !editingRessource) return;
    try {
      await createMedia.mutateAsync({
        mediable_type: 'App\\Models\\Ressource',
        mediable_id: editingRessource,
        type: url.includes('youtube.com') || url.includes('youtu.be') ? 'youtube' : 'lien',
        chemin_fichier: url,
        titre: url,
      });
      toast.success('Lien ajouté');
    } catch {
      toast.error("Erreur lors de l'ajout du lien");
    }
  }

  function promptAddLink() {
    const url = window.prompt('URL du lien (https://...)');
    if (url) handleAddLink(url.trim());
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

      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-6">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder="Rechercher par titre..."
          className="w-full sm:flex-1 min-w-[200px] border border-[#333] rounded px-3 py-2 bg-transparent text-off-white placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        <select value={domaineFilter} onChange={(e) => { setDomaineFilter(e.target.value); setCurrentPage(1); }}
          className="w-full sm:w-auto bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-off-white focus-visible:outline-none">
          <option value="">Tous domaines</option>
          {domaines.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
          className="w-full sm:w-auto bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-off-white focus-visible:outline-none">
          <option value="">Tous types</option>
          {Object.entries(MEDIA_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

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
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ressource-publique" {...form.register("est_publique")} className="accent-acid" />
              <label htmlFor="ressource-publique" className="text-sm text-off-white">Publique</label>
            </div>

            {!editingRessource && (
              <>
                <div className="border-t border-[#222] pt-3">
                  <p className="text-xs font-mono text-muted uppercase tracking-wider mb-2">
                    Média <span className="text-[10px] lowercase text-muted/60">(optionnel — fichier ou lien)</span>
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-muted mb-1">Fichier (image, PDF, vidéo...)</label>
                      <input type="file" accept="image/*,.pdf,.mp4,.webm,.ogg,.mov" onChange={handleMediaChange}
                        className="w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#222] file:text-off-white file:text-xs file:font-mono hover:file:bg-[#333]" />
                      {mediaPreview && (
                        <img src={mediaPreview} alt="" className="mt-2 max-h-20 rounded object-contain border border-[#222]" />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1">Ou URL du média (YouTube, PDF, image...)</label>
                      <input type="url" placeholder="https://..." value={mediaLink} onChange={(e) => setMediaLink(e.target.value)}
                        className="input-base" />
                      {mediaLink && (
                        <p className="text-xs text-muted mt-1 font-mono truncate">
                          <Icons.external className="w-3 h-3 inline mr-1" />
                          {mediaLink}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

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
              const cover = imageMedia ? getMediaUrl(imageMedia.chemin_fichier) : null;
              return (
                <div key={r.id}>
                  <CardContainer hover className="p-4">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                      {cover ? (
                        <div className="w-16 h-12 rounded overflow-hidden bg-[#222] shrink-0 relative cursor-pointer" onClick={() => setViewMedia({ url: cover, titre: r.titre })}>
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
                            {r.medias.map(m => {
                              const url = getMediaUrl(m.chemin_fichier);
                              return (
                                <button key={m.id} type="button" onClick={() => url ? setViewMedia({ url, titre: m.titre ?? undefined }) : undefined}
                                  className="inline-flex items-center gap-1 text-[10px] font-mono text-muted bg-[#1a1a1a] px-1.5 py-0.5 rounded hover:bg-[#2a2a2a] transition-colors cursor-pointer">
                                  {typeIcon(m.type)}
                                  {MEDIA_TYPE_LABELS[m.type] || m.type}
                                </button>
                              );
                            })}
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
                      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                        <h4 className="text-xs font-mono text-muted uppercase tracking-wider">Médias attachés</h4>
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-acid hover:text-acid/80 transition-colors font-mono">
                            <Icons.plus className="w-3.5 h-3.5" aria-hidden />
                            Fichier
                            <input type="file" onChange={handleMediaUpload} className="hidden" />
                          </label>
                          <span className="text-muted text-[10px]">|</span>
                          <span className="flex items-center gap-1.5 text-xs text-acid hover:text-acid/80 transition-colors font-mono cursor-pointer" onClick={promptAddLink}>
                            <Icons.external className="w-3.5 h-3.5" aria-hidden />
                            Lien
                          </span>
                        </div>
                      </div>
                      {(!r.medias || r.medias.length === 0) ? (
                        <p className="text-xs text-muted font-mono text-center py-4">Aucun média. Ajoutez un fichier (PDF, image, vidéo...)</p>
                      ) : (
                        <div className="space-y-2">
                          {r.medias.map(m => {
                            const url = getMediaUrl(m.chemin_fichier);
                            return (
                              <div key={m.id} className="flex items-center gap-3 bg-[#0A0A0A] rounded p-2">
                                <div className="w-10 h-10 rounded overflow-hidden bg-[#222] shrink-0 flex items-center justify-center cursor-pointer" onClick={() => url ? setViewMedia({ url, titre: m.titre ?? undefined }) : null}>
                                  {m.type === 'image' && url ? (
                                    <Image src={url} alt="" width={40} height={40} className="object-cover w-full h-full" unoptimized />
                                  ) : m.type === 'lien' || m.type === 'youtube' ? (
                                    <a href={url ?? '#'} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-acid transition-colors" onClick={(e) => e.stopPropagation()}>
                                      <Icons.external className="w-4 h-4" />
                                    </a>
                                  ) : (
                                    <span className="text-muted">{typeIcon(m.type)}</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => url ? setViewMedia({ url, titre: m.titre ?? undefined }) : null}>
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

      {viewMedia && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setViewMedia(null)} role="dialog" aria-modal="true" aria-label={viewMedia.titre || 'Média'}>
          <button onClick={() => setViewMedia(null)} className="absolute top-4 right-4 text-white/70 hover:text-white z-10 transition-colors" aria-label="Fermer">
            <Icons.close className="w-8 h-8" />
          </button>
          <div className="relative w-full max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
            {viewMedia.url.startsWith('http') && (viewMedia.url.match(/\.(jpg|jpeg|png|gif|webp|svg|avif|bmp)$/i) || viewMedia.url.startsWith('data:image/')) ? (
              <div className="relative w-full h-[88vh]">
                <Image src={viewMedia.url} alt={viewMedia.titre || ''} fill className="object-contain" unoptimized />
              </div>
            ) : viewMedia.url.match(/\.(mp4|webm|ogg|mov)$/i) ? (
              <video src={viewMedia.url} controls className="w-full h-[88vh] mx-auto rounded-lg" />
            ) : (
              <iframe src={viewMedia.url} className="w-full h-[88vh] rounded-lg" title={viewMedia.titre || 'Média'} />
            )}
            {viewMedia.titre && <p className="text-center text-sm text-white/60 mt-3 font-mono">{viewMedia.titre}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
