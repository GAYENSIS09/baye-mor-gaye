'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { uploadImage } from '@/lib/upload';
import { useRouter, useParams } from 'next/navigation';
import { useDomaines, usePublicationById } from '@/hooks/queries';
import { Domaine } from '@/types/api';
import { useUpdatePublication } from '@/hooks/mutations';
import TipTapEditor from '@/components/TipTapEditor';
import { useToast } from '@/contexts/ToastContext';
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
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [type, setType] = useState('article');
  const [extrait, setExtrait] = useState('');
  const [selectedDomaines, setSelectedDomaines] = useState<number[]>([]);
  const [imageCouverture, setImageCouverture] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [estPublie, setEstPublie] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (publication && !initialized) {
      setTitre(publication.titre);
      setContenu(publication.contenu);
      setType(publication.type);
      setExtrait(publication.extrait ?? '');
      setEstPublie(publication.est_publie);
      setSelectedDomaines(publication.domaines?.map((d: Domaine) => d.id) ?? []);
      setImageCouverture(publication.image_couverture ?? '');
      setInitialized(true);
    }
  }, [publication, initialized]);

  useEffect(() => {
    if (!authLoading && !utilisateur) {
      router.push('/login');
    }
  }, [authLoading, utilisateur, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
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
        titre,
        contenu,
        contenu_html: contenu || undefined,
        type,
        extrait: extrait || undefined,
        image_couverture: imageUrl,
        domaines: selectedDomaines.length > 0 ? selectedDomaines : undefined,
        est_publie: estPublie,
      });
      toast.success('Publication modifiée');
      router.push('/dashboard/publications');
    } catch {
      toast.error('Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loadingPub) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-off-white">Modifier la publication</h1>

      <form onSubmit={handleSubmit} className="bg-[#111] p-6 rounded border border-[#222] space-y-4">
        <div>
          <label className="block text-sm font-medium text-off-white">Titre</label>
          <input value={titre} onChange={(e) => setTitre(e.target.value)} required
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-off-white">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="w-full border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white">
            <option value="article">Article</option>
            <option value="tutoriel">Tutoriel</option>
            <option value="note">Note</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-off-white">Extrait</label>
          <textarea value={extrait} onChange={(e) => setExtrait(e.target.value)} rows={2}
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-off-white">Contenu</label>
          <TipTapEditor content={contenu} onChange={setContenu} />
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
          {imageCouverture && <img src={imageCouverture} alt="Preview" className="h-32 object-cover rounded mb-2" />}
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
          {uploading && <p className="text-xs text-muted mt-1">Upload en cours...</p>}
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="publier" checked={estPublie}
            onChange={(e) => setEstPublie(e.target.checked)} className="accent-acid" />
          <label htmlFor="publier" className="text-sm text-off-white">Publier</label>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="bg-acid text-black px-6 py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
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
