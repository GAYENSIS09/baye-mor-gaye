'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProjetFormSchema, type ProjetFormData } from '@/schemas/forms';
import { uploadImage } from '@/lib/upload';
import { useRouter, useParams } from 'next/navigation';
import { useProjetById } from '@/hooks/queries';
import { useUpdateProjet } from '@/hooks/mutations';
import { useToast } from '@/contexts/ToastContext';
import MediaViewer from '@/components/MediaViewer';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function EditProjetPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { data: projet, isLoading: loadingProjet } = useProjetById(id);
  const updateProjet = useUpdateProjet(id);
  const toast = useToast();
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [imageCouverture, setImageCouverture] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProjetFormData>({
    resolver: zodResolver(ProjetFormSchema),
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

  useEffect(() => {
    if (projet && !initialized) {
      setTechnologies(projet.technologies ?? []);
      setImageCouverture(projet.image_couverture ?? '');
      reset({
        titre: projet.titre,
        description: projet.description,
        url_demo: projet.url_demo ?? '',
        url_code: projet.url_code ?? '',
        est_publie: projet.est_publie,
      });
      setInitialized(true);
    }
  }, [projet, initialized, reset]);

  useEffect(() => {
    if (!authLoading && !utilisateur) {
      router.push('/login');
    }
  }, [authLoading, utilisateur, router]);

  async function onSubmit(data: ProjetFormData) {
    let imageUrl = imageCouverture || undefined;
    if (imageFile) {
      setUploading(true);
      try {
        const result = await uploadImage(imageFile, 'projets');
        imageUrl = result.url;
      } catch {
        console.error('Erreur upload image');
        setUploading(false);
        return;
      }
      setUploading(false);
    }
    try {
      await updateProjet.mutateAsync({
        ...data,
        technologies: technologies.length > 0 ? technologies : undefined,
        image_couverture: imageUrl,
      });
      toast.success('Projet modifié');
      router.push('/dashboard/projets');
    } catch {
      toast.error('Erreur lors de la modification');
    }
  }

  if (authLoading || loadingProjet) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-off-white">Modifier le projet</h1>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-[#111] p-6 rounded border border-[#222] space-y-4">
        <div>
          <label className="block text-sm font-medium text-off-white">Titre</label>
          <input {...register("titre")}
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
          {errors.titre && <p className="text-red-400 text-xs mt-1">{errors.titre.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-off-white">Description</label>
          <textarea {...register("description")} required rows={6}
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
          {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-off-white">Technologies</label>
          <div className="flex gap-2 mb-2">
            <input value={techInput} onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
              placeholder="Ajouter une technologie"
              className="flex-1 border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
            <button type="button" onClick={addTech}
              className="bg-[#222] text-off-white px-3 py-2 rounded hover:bg-[#333]">
              +
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {technologies.map((t) => (
              <span key={t} className="bg-acid/10 text-acid text-sm px-2 py-0.5 rounded flex items-center gap-1">
                {t}
                <button type="button" onClick={() => removeTech(t)} className="text-acid hover:text-red-400">&times;</button>
              </span>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-off-white">Image de couverture</label>
          {imageCouverture && <MediaViewer src={imageCouverture} alt="Preview" width={400} height={128} className="h-32 object-cover rounded mb-2" />}
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
          {uploading && <p className="text-xs text-muted mt-1">Upload en cours...</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-off-white">URL demo</label>
            <input {...register("url_demo")} placeholder="https://"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
            {errors.url_demo && <p className="text-red-400 text-xs mt-1">{errors.url_demo.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-off-white">URL code</label>
            <input {...register("url_code")} placeholder="https://"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
            {errors.url_code && <p className="text-red-400 text-xs mt-1">{errors.url_code.message}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="publier" {...register("est_publie")} className="accent-acid" />
          <label htmlFor="publier" className="text-sm text-off-white">Publier</label>
        </div>
        <div className="flex gap-3">
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
    </div>
  );
}
