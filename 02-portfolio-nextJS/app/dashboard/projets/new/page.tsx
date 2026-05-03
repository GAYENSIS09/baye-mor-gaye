'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { uploadImage } from '@/lib/upload';
import { useRouter } from 'next/navigation';
import { useCreateProjet } from '@/hooks/mutations';
import { useToast } from '@/contexts/ToastContext';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function NewProjetPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const router = useRouter();
  const createProjet = useCreateProjet();
  const toast = useToast();
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [urlDemo, setUrlDemo] = useState('');
  const [urlCode, setUrlCode] = useState('');
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [estPublie, setEstPublie] = useState(false);
  const [saving, setSaving] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
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
      await createProjet.mutateAsync({
        titre,
        description,
        technologies: technologies.length > 0 ? technologies : undefined,
        url_demo: urlDemo || undefined,
        url_code: urlCode || undefined,
        image_couverture: imageCouverture,
        est_publie: estPublie,
      });
      toast.success('Projet créé');
      router.push('/dashboard/projets');
    } catch {
      toast.error('Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-off-white">Nouveau projet</h1>
      <form onSubmit={handleSubmit} className="bg-[#111] p-6 rounded border border-[#222] space-y-4">
        <div>
          <label htmlFor="titre" className="block text-sm font-medium text-off-white">Titre</label>
          <input id="titre" name="titre" value={titre} onChange={(e) => setTitre(e.target.value)} required autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-off-white">Description</label>
          <textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={6} autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div>
          <label htmlFor="tech-input" className="block text-sm font-medium text-off-white">Technologies</label>
          <div className="flex gap-2 mb-2">
            <input id="tech-input" name="tech-input" value={techInput} onChange={(e) => setTechInput(e.target.value)}
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
          <input id="image-couverture" name="image_couverture" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          {uploading && <p className="text-xs text-muted mt-1">Upload en cours...</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="url-demo" className="block text-sm font-medium text-off-white">URL demo</label>
            <input id="url-demo" name="url_demo" value={urlDemo} onChange={(e) => setUrlDemo(e.target.value)} placeholder="https://" autoComplete="url"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          </div>
          <div>
            <label htmlFor="url-code" className="block text-sm font-medium text-off-white">URL code</label>
            <input id="url-code" name="url_code" value={urlCode} onChange={(e) => setUrlCode(e.target.value)} placeholder="https://" autoComplete="url"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="publier" name="est_publie" checked={estPublie}
            onChange={(e) => setEstPublie(e.target.checked)} className="accent-acid" />
          <label htmlFor="publier" className="text-sm text-off-white">Publier immediatement</label>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="bg-acid text-black px-6 py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest">
            {saving ? 'Enregistrement...' : 'Creer'}
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
