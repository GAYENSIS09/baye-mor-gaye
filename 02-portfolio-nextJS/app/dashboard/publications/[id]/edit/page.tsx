'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PublicationFormSchema, type PublicationFormData } from '@/schemas/forms';
import { uploadImage, uploadFile } from '@/lib/upload';
import { useRouter, useParams } from 'next/navigation';
import { useDomaines, usePublicationById } from '@/hooks/queries';
import { Domaine, Media } from '@/types/api';
import { useUpdatePublication, useCreatePublicationMedia, useDeletePublicationMedia } from '@/hooks/mutations';
import { getMediaUrl, decodeHtmlEntities } from '@/lib/media';
import TipTapEditor from '@/components/TipTapEditor';
import { useToast } from '@/contexts/ToastContext';
import MediaViewer from '@/components/MediaViewer';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Icons } from '@/components/ui/Icons';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import Image from 'next/image';

export default function EditPublicationPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const pubId = Number(params.id);
  const { data: domaines = [] } = useDomaines();
  const { data: publication, isLoading: loadingPub } = usePublicationById(pubId);
  const updatePublication = useUpdatePublication(pubId);
  const toast = useToast();
  const [contenu, setContenu] = useState('');
  const [selectedDomaines, setSelectedDomaines] = useState<number[]>([]);
  const [imageCouverture, setImageCouverture] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const createMedia = useCreatePublicationMedia();
  const deleteMedia = useDeletePublicationMedia();
  const [confirmDeleteMedia, setConfirmDeleteMedia] = useState<number | null>(null);
  const [viewMedia, setViewMedia] = useState<{ url: string; titre?: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<PublicationFormData>({
    resolver: zodResolver(PublicationFormSchema),
    defaultValues: { contenu: '' },
  });

  useEffect(() => {
    if (publication && !initialized) {
      const decodedContenu = decodeHtmlEntities(publication.contenu);
      setContenu(decodedContenu);
      setSelectedDomaines(publication.domaines?.map((d: Domaine) => d.id) ?? []);
      setImageCouverture(publication.image_couverture ?? '');
      setImagePreviewUrl('');
      setImageFile(null);
      reset({
        titre: publication.titre,
        type: publication.type as 'article' | 'tutoriel' | 'note',
        extrait: publication.extrait ?? '',
        est_publie: publication.est_publie,
        contenu: decodedContenu,
      });
      setInitialized(true);
    }
  }, [publication, initialized, reset, setValue]);

  useEffect(() => {
    if (!authLoading && !utilisateur) {
      router.push('/login');
    }
  }, [authLoading, utilisateur, router]);

  function handleContenuChange(value: string) {
    setContenu(value);
    setValue('contenu', value, { shouldValidate: false });
  }

  async function onSubmit(data: PublicationFormData) {
    let imageUrl = imageCouverture || undefined;
    if (imageFile) {
      setUploading(true);
      try {
        const result = await uploadImage(imageFile, 'publications');
        imageUrl = result.url;
      } catch {
        console.error('Erreur upload image');
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    try {
      await updatePublication.mutateAsync({
        ...data,
        contenu,
        contenu_html: contenu || undefined,
        image_couverture: imageUrl,
        domaines: selectedDomaines.length > 0 ? selectedDomaines : undefined,
      });
      toast.success('Publication modifiée');
      router.push('/dashboard/publications');
    } catch {
      toast.error('Erreur lors de la modification');
    }
  }

  function getMediaType(file: File): string {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type === 'application/pdf') return 'document';
    return 'document';
  }

  async function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !publication) return;
    try {
      const uploaded = file.type.startsWith('image/')
        ? await uploadImage(file, 'publications')
        : await uploadFile(file, 'publications');
      await createMedia.mutateAsync({
        mediable_type: 'App\\Models\\Publication',
        mediable_id: publication.id,
        type: getMediaType(file),
        chemin_fichier: uploaded.path,
        titre: file.name,
      });
      toast.success('Fichier ajouté');
    } catch {
      toast.error("Erreur lors de l'upload");
    }
    e.target.value = '';
  }

  async function handleAddLink(url: string) {
    if (!url || !publication) return;
    try {
      const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
      await createMedia.mutateAsync({
        mediable_type: 'App\\Models\\Publication',
        mediable_id: publication.id,
        type: isYoutube ? 'youtube' : 'lien',
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

  if (authLoading || loadingPub) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-off-white">Modifier la publication</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full bg-[#111] p-6 rounded border border-[#222] space-y-4">
        <div>
          <label className="block text-sm font-medium text-off-white">Titre</label>
          <input {...register("titre")}
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
          {errors.titre && <p className="text-red-400 text-xs mt-1">{errors.titre.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-off-white">Type</label>
          <select {...register("type")}
            className="w-full border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white">
            <option value="article">Article</option>
            <option value="tutoriel">Tutoriel</option>
            <option value="note">Note</option>
          </select>
          {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-off-white">Extrait</label>
          <textarea {...register("extrait")} rows={2}
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-off-white">Contenu</label>
          <TipTapEditor content={contenu} onChange={handleContenuChange} />
          {errors.contenu && <p className="text-red-400 text-xs mt-1">{errors.contenu.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-off-white mb-1">Domaines</label>
          <div className="flex flex-wrap gap-2">
            {domaines.map((d) => (
              <label key={d.id} className="flex items-center gap-1 text-sm text-off-white">
                <input type="checkbox" checked={selectedDomaines.includes(d.id)}
                  onChange={() => setSelectedDomaines((prev) =>
                    prev.includes(d.id) ? prev.filter((id) => id !== d.id) : [...prev, d.id]
                  )} className="accent-acid" />
                {d.nom}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-off-white">Image de couverture</label>
          {(imagePreviewUrl || imageCouverture) && (
            <MediaViewer src={imagePreviewUrl || imageCouverture} alt="Preview" width={400} height={128} className="h-32 object-cover rounded mb-2" />
          )}
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setImageFile(file);
            if (file) {
              const reader = new FileReader();
              reader.onload = () => setImagePreviewUrl(reader.result as string);
              reader.readAsDataURL(file);
            } else {
              setImagePreviewUrl('');
            }
          }}
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
          {uploading && <p className="text-xs text-muted mt-1">Upload en cours...</p>}
        </div>
        <div className="border-t border-[#222] pt-3">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <p className="text-xs font-mono text-muted uppercase tracking-wider">Médias attachés</p>
            <div className="flex items-center gap-2">
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
          {(!publication?.medias || publication.medias.length === 0) ? (
            <p className="text-xs text-muted font-mono text-center py-4">Aucun média. Ajoutez un fichier (PDF, image, vidéo...) ou un lien.</p>
          ) : (
            <div className="space-y-2">
              {publication.medias.map((m: Media) => {
                const url = getMediaUrl(m.chemin_fichier);
                return (
                  <div key={m.id} className="group flex items-center gap-3 bg-[#0A0A0A] rounded p-2">
                    <div className="w-10 h-10 rounded overflow-hidden bg-[#222] shrink-0 flex items-center justify-center cursor-pointer" onClick={() => url ? setViewMedia({ url, titre: m.titre ?? undefined }) : null}>
                      {m.type === 'image' && url ? (
                        <Image src={url} alt="" width={40} height={40} className="object-cover w-full h-full" unoptimized />
                      ) : m.type === 'lien' || m.type === 'youtube' ? (
                        <a href={url ?? '#'} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-acid transition-colors" onClick={(e) => e.stopPropagation()}>
                          <Icons.external className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-muted"><Icons.file className="w-4 h-4" /></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => url ? setViewMedia({ url, titre: m.titre ?? undefined }) : null}>
                      <p className="text-xs text-off-white truncate">{m.titre || 'Sans titre'}</p>
                      <p className="text-[10px] text-muted font-mono">{m.type}</p>
                      {m.chemin_fichier && <p className="text-[10px] text-acid/60 font-mono truncate hidden group-hover:block" title={m.chemin_fichier}>{m.chemin_fichier}</p>}
                    </div>
                    <button type="button" onClick={() => setConfirmDeleteMedia(m.id)} className="text-red-400 hover:text-red-300 transition-colors">
                      <Icons.trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="publier" {...register("est_publie")} className="accent-acid" />
          <label htmlFor="publier" className="text-sm text-off-white">Publier</label>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button type="submit" disabled={isSubmitting}
            className="bg-acid text-black px-6 py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest">
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="bg-[#222] text-off-white px-6 py-2 rounded hover:bg-[#333] font-mono text-xs uppercase tracking-widest">
            Annuler
          </button>
        </div>
      </form>
      <ConfirmDialog open={confirmDeleteMedia !== null} title="Supprimer le média" message="Ce fichier sera définitivement supprimé." destructive confirmLabel="Supprimer" onConfirm={() => { if (confirmDeleteMedia) handleDeleteMedia(confirmDeleteMedia); } } onCancel={() => setConfirmDeleteMedia(null)} />

      {viewMedia && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setViewMedia(null)} role="dialog" aria-modal="true">
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
