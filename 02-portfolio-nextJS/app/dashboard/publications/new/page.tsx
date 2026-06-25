'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PublicationFormSchema, type PublicationFormData } from '@/schemas/forms';
import { useRouter } from 'next/navigation';
import { useDomaines } from '@/hooks/queries';
import { useCreatePublication, useCreatePublicationMedia } from '@/hooks/mutations';
import { useToast } from '@/contexts/ToastContext';
import { uploadFile, uploadImage } from '@/lib/upload';
import { Icons } from '@/components/ui/Icons';
import TipTapEditor from '@/components/TipTapEditor';
import Dropzone from '@/components/Dropzone';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function NewPublicationPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data: domaines = [] } = useDomaines();
  const createPublication = useCreatePublication();
  const createMedia = useCreatePublicationMedia();
  const toast = useToast();
  const [contenu, setContenu] = useState('');
  const [selectedDomaines, setSelectedDomaines] = useState<number[]>([]);
  const [imageCouverture, setImageCouverture] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaLink, setMediaLink] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<PublicationFormData>({
    resolver: zodResolver(PublicationFormSchema),
    defaultValues: {
      titre: '',
      type: 'article',
      extrait: '',
      contenu: '',
      est_publie: false,
    },
  });

  function handleContenuChange(value: string) {
    setContenu(value);
    setValue('contenu', value, { shouldValidate: false });
  }

  function handleMediaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setMediaFile(f);
    const reader = new FileReader();
    reader.onload = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function onSubmit(data: PublicationFormData) {
    try {
      const res = await createPublication.mutateAsync({
        ...data,
        contenu,
        contenu_html: contenu || undefined,
        image_couverture: imageCouverture || undefined,
        domaines: selectedDomaines.length > 0 ? selectedDomaines : undefined,
      });
      const publicationId = (res as { id?: number })?.id ?? (res as { data?: { id?: number } })?.data?.id;
      if (publicationId) {
        if (mediaFile) {
          const uploaded = mediaFile.type.startsWith('image/')
            ? await uploadImage(mediaFile, 'publications')
            : await uploadFile(mediaFile, 'publications');
          const type = mediaFile.type.startsWith('image/') ? 'image'
            : mediaFile.type.startsWith('video/') ? 'video'
            : mediaFile.type === 'application/pdf' ? 'document'
            : 'document';
          await createMedia.mutateAsync({
            mediable_type: 'App\\Models\\Publication',
            mediable_id: publicationId,
            type,
            chemin_fichier: uploaded.path,
            titre: mediaFile.name,
          });
        }
        if (mediaLink) {
          const isYoutube = /youtube\.com|youtu\.be/.test(mediaLink);
          await createMedia.mutateAsync({
            mediable_type: 'App\\Models\\Publication',
            mediable_id: publicationId,
            type: isYoutube ? 'youtube' : 'lien',
            chemin_fichier: mediaLink,
            titre: mediaLink,
          });
        }
      }
      toast.success('Publication créée');
      router.push('/dashboard/publications');
    } catch {
      toast.error('Erreur lors de la création');
    }
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-off-white">Nouvelle publication</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-[#111] p-6 rounded border border-[#222] space-y-4">
        <div>
          <label htmlFor="titre" className="block text-sm font-medium text-off-white">Titre</label>
          <input id="titre" {...register("titre")} autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          {errors.titre && <p className="text-red-400 text-xs mt-1">{errors.titre.message}</p>}
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-off-white">Type</label>
          <select id="type" {...register("type")}
            className="w-full border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50">
            <option value="article">Article</option>
            <option value="tutoriel">Tutoriel</option>
            <option value="note">Note</option>
          </select>
          {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type.message}</p>}
        </div>
        <div>
          <label htmlFor="extrait" className="block text-sm font-medium text-off-white">Extrait</label>
          <textarea id="extrait" {...register("extrait")} rows={2} autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div>
          <label htmlFor="contenu" className="block text-sm font-medium text-off-white">Contenu</label>
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
          <label className="block text-sm font-medium text-off-white mb-1">Image de couverture</label>
          <Dropzone onUpload={(url) => setImageCouverture(url)} />
        </div>
        <div className="border-t border-[#222] pt-3">
          <p className="text-xs font-mono text-muted uppercase tracking-wider mb-2">
            Médias <span className="text-[10px] lowercase text-muted/60">(optionnel — fichier ou lien)</span>
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
        <div className="flex items-center gap-2">
          <input type="checkbox" id="publier" {...register("est_publie")} className="accent-acid" />
          <label htmlFor="publier" className="text-sm text-off-white">Publier immediatement</label>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={isSubmitting}
            className="bg-acid text-black px-6 py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest">
            {isSubmitting ? 'Enregistrement...' : 'Creer'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="bg-[#222] text-off-white px-6 py-2 rounded hover:bg-[#333] font-mono text-xs uppercase tracking-widest">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
