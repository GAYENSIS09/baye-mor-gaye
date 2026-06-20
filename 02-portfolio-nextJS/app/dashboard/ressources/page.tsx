'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RessourceFormSchema, type RessourceFormData } from '@/schemas/forms';
import { useRessources, useDomaines } from '@/hooks/queries';
import { useCreateRessource, useDeleteRessource, useCreateRessourceMedia } from '@/hooks/mutations';
import { uploadImage, uploadFile } from '@/lib/upload';
import ConfirmDialog from '@/components/ConfirmDialog';
import { LoadingScreen } from '@/components/LoadingScreen';
import Pagination from '@/components/Pagination';
import { useToast } from '@/contexts/ToastContext';
import Link from 'next/link';
import Image from 'next/image';
import { Icons } from '@/components/ui/Icons';
import MediaViewer from '@/components/MediaViewer';

const STORAGE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '/storage') || 'http://localhost:8000/storage';

export default function RessourcesDashboardPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const params: Record<string, string> = { page: String(currentPage) };
  const { data: ressourcesRes, isLoading, isError, refetch } = useRessources(params);
  const ressources = ressourcesRes?.data ?? [];
  const lastPage = ressourcesRes?.last_page ?? 1;
  const total = ressourcesRes?.total ?? 0;
  const { data: domaines = [] } = useDomaines();
  const createRessource = useCreateRessource();
  const deleteRessource = useDeleteRessource();
  const createMedia = useCreateRessourceMedia();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RessourceFormData>({
    resolver: zodResolver(RessourceFormSchema),
    defaultValues: {
      titre: '',
      domaine_id: undefined,
    },
  });

  async function onCreate(data: RessourceFormData) {
    try {
      const res = await createRessource.mutateAsync({
        titre: data.titre,
        description: data.description || undefined,
        domaine_id: data.domaine_id || undefined,
        est_publique: data.est_publique ?? true,
      });
      const ressourceId = (res as { id?: number })?.id ?? (res as { data?: { id?: number } })?.data?.id;
      if (!ressourceId) throw new Error('No ID returned');

      if (file) {
          const uploaded = await uploadFile(file, 'ressources');
        await createMedia.mutateAsync({
          qualifiable_type: 'ressource',
          qualifiable_id: ressourceId,
          type: uploaded.mime?.split('/')[0] || 'fichier',
          chemin_fichier: uploaded.path,
          titre: uploaded.name || data.titre,
        });
      }

      if (coverFile) {
        const uploadResult = await uploadImage(coverFile, 'ressources');
        await createMedia.mutateAsync({
          qualifiable_type: 'ressource',
          qualifiable_id: ressourceId,
          type: 'image',
          chemin_fichier: uploadResult.path,
          titre: `Couverture - ${data.titre}`,
        });
      }

      reset({ titre: '', description: '', domaine_id: undefined });
      setFile(null);
      setFilePreview(null);
      setCoverFile(null);
      setCoverPreview(null);
      setShowForm(false);
      toast.success('Ressource ajoutée');
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setFilePreview(URL.createObjectURL(f));
    }
  }

  function handleCoverSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setCoverFile(f);
      setCoverPreview(URL.createObjectURL(f));
    }
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-off-white">Ressources</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 font-mono text-xs uppercase tracking-widest">
          {showForm ? 'Annuler' : 'Nouvelle ressource'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onCreate)} noValidate className="bg-[#111] p-4 rounded border border-[#222] mb-6 space-y-3">
          <div>
            <input {...register("titre")} placeholder="Titre" required autoComplete="off"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            {errors.titre && <p className="text-red-400 text-xs mt-1">{errors.titre.message}</p>}
          </div>
          <div>
            <textarea {...register("description")} placeholder="Description" rows={3}
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50 resize-none" />
          </div>
          <div>
            <select {...register("domaine_id")}
              className="w-full border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50">
              <option value="">Sans domaine</option>
              {domaines.map((d) => (
                <option key={d.id} value={d.id}>{d.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="flex items-center gap-2 px-3 py-2 border border-[#333] rounded hover:border-acid/50 transition-colors">
                <Icons.document className="w-4 h-4 text-muted" aria-hidden />
                <span className="text-sm text-muted group-hover:text-off-white transition-colors">
                  {file ? file.name : 'Ajouter un fichier (PDF, image, vidéo...)'}
                </span>
              </div>
              <input type="file" onChange={handleFileSelect} className="hidden" />
              {filePreview && (
                <button type="button" onClick={() => { setFile(null); setFilePreview(null); }}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors" aria-label="Retirer le fichier">
                  <Icons.close className="w-4 h-4" />
                </button>
              )}
            </label>
          </div>
          {filePreview && (
            <div className="relative aspect-video rounded overflow-hidden bg-[#1a1a1a] max-w-xs">
              {file?.type.startsWith('image/') ? (
                <Image src={filePreview} alt="Aperçu" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex items-center justify-center h-full text-muted text-sm font-mono p-4 text-center">
                  <Icons.file className="w-8 h-8 mr-2" aria-hidden />
                  {file?.name}
                </div>
              )}
            </div>
          )}
          <div>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="flex items-center gap-2 px-3 py-2 border border-[#333] rounded hover:border-acid/50 transition-colors">
                <Icons.document className="w-4 h-4 text-muted" aria-hidden />
                <span className="text-sm text-muted group-hover:text-off-white transition-colors">
                  {coverFile ? coverFile.name : 'Ajouter une couverture (optionnel)'}
                </span>
              </div>
              <input type="file" accept="image/*" onChange={handleCoverSelect} className="hidden" />
              {coverPreview && (
                <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null); }}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors" aria-label="Retirer la couverture">
                  <Icons.close className="w-4 h-4" />
                </button>
              )}
            </label>
          </div>
          {coverPreview && (
            <div className="relative aspect-video rounded overflow-hidden bg-[#1a1a1a] max-w-xs">
              <Image src={coverPreview} alt="Aperçu couverture" fill className="object-cover" unoptimized />
            </div>
          )}
          <button type="submit" disabled={isSubmitting} className="bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest">
            {isSubmitting ? 'Ajout...' : 'Ajouter'}
          </button>
        </form>
      )}

      {isError ? (
        <div className="text-center py-16">
          <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur chargement ressources</p>
          <button onClick={() => refetch()} className="bg-acid text-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-acid/90 transition-colors rounded">
            Réessayer
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-[#222] rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {ressources.map((r) => {
            const firstMedia = r.media?.[0];
            const cover = r.media?.find(m => m.type === 'image')?.chemin_fichier
              ? `${STORAGE_URL}/${r.media.find(m => m.type === 'image')!.chemin_fichier.replace(/^\//, '')}`
              : null;
            const previewUrl = firstMedia ? `${STORAGE_URL}/${firstMedia.chemin_fichier.replace(/^\//, '')}` : null;
            return (
              <div key={r.id} className="bg-[#111] p-4 rounded border border-[#222] flex items-center gap-4">
                {cover ? (
                  <div className="w-16 h-12 relative rounded overflow-hidden bg-[#1a1a1a] shrink-0">
                    <Image src={cover} alt="" fill className="object-cover" unoptimized />
                  </div>
                ) : previewUrl ? (
                  <div className="w-16 h-12 relative rounded overflow-hidden bg-[#1a1a1a] shrink-0">
                    <MediaViewer src={previewUrl} alt="" fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-12 rounded bg-[#222] flex items-center justify-center shrink-0">
                    <Icons.file className="w-5 h-5 text-muted" aria-hidden />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-off-white truncate">{r.titre}</p>
                    {r.domaine && (
                      <Link href="/dashboard/domaines" className="text-xs bg-acid/10 text-acid px-2 py-0.5 rounded hover:bg-acid/20 transition-colors shrink-0">
                        {r.domaine.nom}
                      </Link>
                    )}
                  </div>
                  {r.description && (
                    <p className="text-sm text-muted truncate">{r.description}</p>
                  )}
                </div>
                <button onClick={() => setConfirmDelete(r.id)} aria-label={`Supprimer ${r.titre}`}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors rounded hover:bg-red-400/10">
                  <Icons.trash className="w-4 h-4" />
                </button>
              </div>
            );
          })}
          {ressources.length === 0 && <div className="text-center py-12"><svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-muted font-mono text-sm">Aucune ressource.</p></div>}
        </div>
      )}

      <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer la ressource" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteRessource.mutateAsync(confirmDelete); toast.success('Ressource supprimée'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}