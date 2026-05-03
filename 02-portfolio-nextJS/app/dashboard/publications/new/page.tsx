'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDomaines } from '@/hooks/queries';
import { useCreatePublication } from '@/hooks/mutations';
import { useToast } from '@/contexts/ToastContext';
import TipTapEditor from '@/components/TipTapEditor';
import Dropzone from '@/components/Dropzone';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function NewPublicationPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data: domaines = [] } = useDomaines();
  const createPublication = useCreatePublication();
  const toast = useToast();
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [type, setType] = useState('article');
  const [extrait, setExtrait] = useState('');
  const [selectedDomaines, setSelectedDomaines] = useState<number[]>([]);
  const [imageCouverture, setImageCouverture] = useState('');
  const [estPublie, setEstPublie] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createPublication.mutateAsync({
        titre,
        contenu,
        contenu_html: contenu || undefined,
        type,
        extrait: extrait || undefined,
        image_couverture: imageCouverture || undefined,
        domaines: selectedDomaines.length > 0 ? selectedDomaines : undefined,
        est_publie: estPublie,
      });
      toast.success('Publication créée');
      router.push('/dashboard/publications');
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
      <h1 className="text-2xl font-bold mb-6 text-off-white">Nouvelle publication</h1>

      <form onSubmit={handleSubmit} className="bg-[#111] p-6 rounded border border-[#222] space-y-4">
        <div>
          <label htmlFor="titre" className="block text-sm font-medium text-off-white">Titre</label>
          <input id="titre" name="titre" value={titre} onChange={(e) => setTitre(e.target.value)} required autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-off-white">Type</label>
          <select id="type" name="type" value={type} onChange={(e) => setType(e.target.value)}
            className="w-full border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50">
            <option value="article">Article</option>
            <option value="tutoriel">Tutoriel</option>
            <option value="note">Note</option>
          </select>
        </div>
        <div>
          <label htmlFor="extrait" className="block text-sm font-medium text-off-white">Extrait</label>
          <textarea id="extrait" name="extrait" value={extrait} onChange={(e) => setExtrait(e.target.value)} rows={2} autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div>
          <label htmlFor="contenu" className="block text-sm font-medium text-off-white">Contenu</label>
          <TipTapEditor content={contenu} onChange={setContenu} />
        </div>
        <div>
          <label className="block text-sm font-medium text-off-white mb-1">Domaines</label>
          <div className="flex flex-wrap gap-2">
            {domaines.map((d) => (
              <label key={d.id} className="flex items-center gap-1 text-sm text-off-white">
                <input type="checkbox" name="domaines" checked={selectedDomaines.includes(d.id)}
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
