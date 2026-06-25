'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProjetFormSchema, type ProjetFormData } from '@/schemas/forms';
import { uploadImage } from '@/lib/upload';
import { useRouter } from 'next/navigation';
import { useCreateProjet } from '@/hooks/mutations';
import { useToast } from '@/contexts/ToastContext';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCreateProjetMedia } from '@/hooks/mutations';
import { uploadFile } from '@/lib/upload';
import { Icons } from '@/components/ui/Icons';

export default function NewProjetPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const router = useRouter();
  const createProjet = useCreateProjet();
  const createMedia = useCreateProjetMedia();
  const toast = useToast();
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaLink, setMediaLink] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjetFormData>({
    resolver: zodResolver(ProjetFormSchema),
    defaultValues: {
      titre: '',
      description: '',
      courte_description: '',
      url_demo: '',
      url_code: '',
      date_realisation: '',
      est_publie: false,
      est_en_vedette: false,
    },
  });

  function addTech() {
    const t = techInput.trim();
    if (t && !technologies.includes(t)) {
      setTechnologies([...technologies, t]);
      setTechInput('');
    }
  }

  function removeTech(t: string) {
    setTechnologies(technologies.filter((x) => x !== t));
  }

  function handleMediaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setMediaFile(f);
    const reader = new FileReader();
    reader.onload = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function onSubmit(data: ProjetFormData) {
    let imageCouverture: string | undefined;
    if (imageFile) {
      setUploading(true);
      try {
        const result = await uploadImage(imageFile, 'projets');
        imageCouverture = result.url;
      } catch {
        console.error('Erreur upload image');
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    try {
      const res = await createProjet.mutateAsync({
        ...data,
        technologies: technologies.length > 0 ? technologies : undefined,
        image_couverture: imageCouverture,
      });
      const projectId = (res as { id?: number })?.id ?? (res as { data?: { id?: number } })?.data?.id;
      if ((mediaFile || mediaLink) && projectId) {
        if (mediaFile) {
          const isImage = mediaFile.type.startsWith('image/');
          const uploaded = isImage
            ? await uploadImage(mediaFile, 'projets')
            : await uploadFile(mediaFile, 'projets');
          const type = isImage ? 'image' : (mediaFile.type.startsWith('video/') ? 'video' : 'fichier');
          await createMedia.mutateAsync({
            mediable_type: 'App\\Models\\ProjetPortfolio',
            mediable_id: projectId,
            type,
            chemin_fichier: isImage ? uploaded.url : uploaded.path,
            titre: mediaFile.name,
          });
        }
        if (mediaLink) {
          const isYoutube = /youtube\.com|youtu\.be/.test(mediaLink);
          await createMedia.mutateAsync({
            mediable_type: 'App\\Models\\ProjetPortfolio',
            mediable_id: projectId,
            type: isYoutube ? 'youtube' : 'lien',
            chemin_fichier: mediaLink,
            titre: mediaLink,
          });
        }
      }
      toast.success('Projet créé');
      router.push('/dashboard/projets');
    } catch {
      toast.error('Erreur lors de la création');
    }
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-off-white">Nouveau projet</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-[#111] p-6 rounded border border-[#222] space-y-4">
        <div>
          <label htmlFor="titre" className="block text-sm font-medium text-off-white">Titre</label>
          <input id="titre" {...register("titre")} autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          {errors.titre && <p className="text-red-400 text-xs mt-1">{errors.titre.message}</p>}
        </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-off-white">Description</label>
            <textarea id="description" {...register("description")} required rows={6} autoComplete="off"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <label htmlFor="courte-description" className="block text-sm font-medium text-off-white">Courte description</label>
            <input id="courte-description" {...register("courte_description")} placeholder="Resume en une phrase" autoComplete="off"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          </div>
        <div>
          <label htmlFor="tech-input" className="block text-sm font-medium text-off-white">Technologies</label>
          <div className="flex gap-2 mb-2">
            <input id="tech-input" value={techInput} onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
              placeholder="Ajouter une technologie"
              className="flex-1 border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            <button type="button" onClick={addTech} aria-label="Ajouter la technologie"
              className="bg-[#222] text-off-white px-3 py-2 rounded hover:bg-[#333]">
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {technologies.map((t) => (
              <span key={t} className="bg-acid/10 text-acid text-sm px-2 py-0.5 rounded flex items-center gap-1">
                {t}
                <button type="button" onClick={() => removeTech(t)} aria-label={`Supprimer ${t}`} className="text-acid hover:text-red-400">&times;</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="image-couverture" className="block text-sm font-medium text-off-white">Image de couverture</label>
          <input id="image-couverture" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          {uploading && <p className="text-xs text-muted mt-1">Upload en cours...</p>}
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
        <div>
          <label htmlFor="date-realisation" className="block text-sm font-medium text-off-white">Date de realisation</label>
          <input id="date-realisation" type="date" {...register("date_realisation")} autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="url-demo" className="block text-sm font-medium text-off-white">URL demo</label>
            <input id="url-demo" {...register("url_demo")} placeholder="https://" autoComplete="url"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            {errors.url_demo && <p className="text-red-400 text-xs mt-1">{errors.url_demo.message}</p>}
          </div>
          <div>
            <label htmlFor="url-code" className="block text-sm font-medium text-off-white">URL code</label>
            <input id="url-code" {...register("url_code")} placeholder="https://" autoComplete="url"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            {errors.url_code && <p className="text-red-400 text-xs mt-1">{errors.url_code.message}</p>}
          </div>
        </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="publier" {...register("est_publie")} className="accent-acid" />
            <label htmlFor="publier" className="text-sm text-off-white">Publier immediatement</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="en-vedette" {...register("est_en_vedette")} className="accent-acid" />
            <label htmlFor="en-vedette" className="text-sm text-off-white">Mettre en vedette</label>
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
