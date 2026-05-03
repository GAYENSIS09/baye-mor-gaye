'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { uploadImage } from '@/lib/upload';
import { useRouter, useParams } from 'next/navigation';
import { useProjetById } from '@/hooks/queries';
import { useUpdateProjet } from '@/hooks/mutations';
import { useToast } from '@/contexts/ToastContext';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function EditProjetPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { data: projet, isLoading: loadingProjet } = useProjetById(id);
  const updateProjet = useUpdateProjet(id);
  const toast = useToast();
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [urlDemo, setUrlDemo] = useState('');
  const [urlCode, setUrlCode] = useState('');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [imageCouverture, setImageCouverture] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [estPublie, setEstPublie] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

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
      setTitre(projet.titre);
      setDescription(projet.description);
      setUrlDemo(projet.url_demo ?? '');
      setUrlCode(projet.url_code ?? '');
      setTechnologies(projet.technologies ?? []);
      setImageCouverture(projet.image_couverture ?? '');
      setEstPublie(projet.est_publie);
      setInitialized(true);
    }
  }, [projet, initialized]);

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
        titre,
        description,
        technologies: technologies.length > 0 ? technologies : undefined,
        url_demo: urlDemo || undefined,
        url_code: urlCode || undefined,
        image_couverture: imageUrl,
        est_publie: estPublie,
      });
      toast.success('Projet modifié');
      router.push('/dashboard/projets');
    } catch {
      toast.error('Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loadingProjet) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-off-white">Modifier le projet</h1>
      <form onSubmit={handleSubmit} className="bg-[#111] p-6 rounded border border-[#222] space-y-4">
        <div>
          <label className="block text-sm font-medium text-off-white">Titre</label>
          <input value={titre} onChange={(e) => setTitre(e.target.value)} required
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
        </div>
        <div>
          <label className="block text-sm font-medium text-off-white">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={6}
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
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
          {imageCouverture && <img src={imageCouverture} alt="Preview" className="h-32 object-cover rounded mb-2" />}
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
          {uploading && <p className="text-xs text-muted mt-1">Upload en cours...</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-off-white">URL demo</label>
            <input value={urlDemo} onChange={(e) => setUrlDemo(e.target.value)} placeholder="https://"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-off-white">URL code</label>
            <input value={urlCode} onChange={(e) => setUrlCode(e.target.value)} placeholder="https://"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white" />
          </div>
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
