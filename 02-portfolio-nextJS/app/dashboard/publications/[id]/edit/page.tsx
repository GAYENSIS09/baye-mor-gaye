'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PublicationFormSchema, type PublicationFormData } from '@/schemas/forms';
import { uploadImage } from '@/lib/upload';
import { useRouter, useParams } from 'next/navigation';
import { useDomaines, usePublicationById } from '@/hooks/queries';
import { Domaine } from '@/types/api';
import { useUpdatePublication } from '@/hooks/mutations';
import TipTapEditor from '@/components/TipTapEditor';
import { useToast } from '@/contexts/ToastContext';
import MediaViewer from '@/components/MediaViewer';
import { LoadingScreen } from '@/components/LoadingScreen';

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
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<PublicationFormData>({
    resolver: zodResolver(PublicationFormSchema),
  });

  useEffect(() => {
    if (publication && !initialized) {
      setContenu(publication.contenu);
      setValue('contenu', publication.contenu, { shouldValidate: false });
      setSelectedDomaines(publication.domaines?.map((d: Domaine) => d.id) ?? []);
      setImageCouverture(publication.image_couverture ?? '');
      reset({
        titre: publication.titre,
        type: publication.type as 'article' | 'tutoriel' | 'note',
        extrait: publication.extrait ?? '',
        est_publie: publication.est_publie,
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

  if (authLoading || loadingPub) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-off-white">Modifier la publication</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-[#111] p-6 rounded border border-[#222] space-y-4">
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
          {imageCouverture && <MediaViewer src={imageCouverture} alt="Preview" width={400} height={128} className="h-32 object-cover rounded mb-2" />}
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
          {uploading && <p className="text-xs text-muted mt-1">Upload en cours...</p>}
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
