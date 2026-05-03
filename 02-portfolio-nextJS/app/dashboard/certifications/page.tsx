'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useCertifications } from '@/hooks/queries';
import { useCreateCertification, useUpdateCertification, useDeleteCertification } from '@/hooks/mutations';
import { Certification } from '@/types/api';
import { useToast } from '@/contexts/ToastContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import { LoadingScreen } from '@/components/LoadingScreen';

interface FormData {
  titre: string; organisme: string; description: string;
  date_obtention: string; date_expiration: string; url_credential: string; ordre: number;
}

const emptyForm = (): FormData => ({
  titre: '', organisme: '', description: '', date_obtention: '', date_expiration: '', url_credential: '', ordre: 0,
});

export default function CertificationsPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const { data: certifications = [], isLoading, isError, refetch } = useCertifications();
  const createCert = useCreateCertification();
  const updateCert = useUpdateCertification();
  const deleteCert = useDeleteCertification();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  function resetForm() { setForm(emptyForm()); setEditId(null); setShowForm(false); setMediaFile(null); setMediaPreview(''); }

  function handleMediaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setMediaFile(f);
    const reader = new FileReader();
    reader.onload = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, description: form.description || undefined, url_credential: form.url_credential || undefined };
      if (mediaFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => { if (v !== undefined) fd.append(k, String(v)); });
        fd.append('media', mediaFile);
        if (editId) {
          fd.append('_method', 'PUT');
          await updateCert.mutateAsync(fd as any);
        } else {
          await createCert.mutateAsync(fd as any);
        }
      } else {
        if (editId) {
          await updateCert.mutateAsync({ id: editId, ...payload });
        } else {
          await createCert.mutateAsync(payload);
        }
      }
      toast.success(editId ? 'Certification modifiée' : 'Certification ajoutée');
      resetForm();
    } catch { toast.error("Erreur lors de l'enregistrement"); }
    finally { setSaving(false); }
  }

  function startEdit(c: Certification) {
    const exp = c as Certification & { date_expiration?: string; ordre?: number };
    setForm({ titre: c.titre, organisme: c.organisme, description: c.description || '', date_obtention: c.date_obtention?.split('T')[0] || '', date_expiration: exp.date_expiration?.split('T')[0] || '', url_credential: c.url_credential || '', ordre: exp.ordre ?? 0 });
    setEditId(c.id);
    setShowForm(true);
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-off-white">Certifications</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className={`px-4 py-2 rounded font-mono text-xs uppercase tracking-widest transition-colors ${showForm ? 'bg-[#222] text-off-white' : 'bg-acid text-black hover:bg-acid/90'}`}>
          {showForm ? 'Annuler' : 'Nouvelle certification'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#111] p-4 rounded border border-[#222] mb-6 space-y-3">
          <h2 className="font-semibold text-off-white">{editId ? 'Modifier' : 'Nouvelle'} certification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="cert-titre" className="sr-only">Titre</label>
              <input id="cert-titre" name="titre" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })} placeholder="Titre *" required autoComplete="off" className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            </div>
            <div>
              <label htmlFor="cert-organisme" className="sr-only">Organisme</label>
              <input id="cert-organisme" name="organisme" value={form.organisme} onChange={(e) => setForm({ ...form, organisme: e.target.value })} placeholder="Organisme *" required autoComplete="off" className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            </div>
            <div>
              <label htmlFor="cert-date" className="sr-only">Date d'obtention</label>
              <input id="cert-date" name="date_obtention" type="date" value={form.date_obtention} onChange={(e) => setForm({ ...form, date_obtention: e.target.value })} required className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            </div>
            <div>
              <label htmlFor="cert-url" className="sr-only">URL du credential</label>
              <input id="cert-url" name="url_credential" type="url" value={form.url_credential} onChange={(e) => setForm({ ...form, url_credential: e.target.value })} placeholder="URL du justificatif" autoComplete="url" className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            </div>
            <div>
              <label htmlFor="cert-expiration" className="sr-only">Date d'expiration</label>
              <input id="cert-expiration" name="date_expiration" type="date" value={form.date_expiration} onChange={(e) => setForm({ ...form, date_expiration: e.target.value })} placeholder="Date d'expiration" className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            </div>
            <div>
              <label htmlFor="cert-ordre" className="sr-only">Ordre</label>
              <input id="cert-ordre" name="ordre" type="number" min="0" value={form.ordre} onChange={(e) => setForm({ ...form, ordre: parseInt(e.target.value) || 0 })} placeholder="Ordre" className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            </div>
          </div>
          <div>
            <label htmlFor="cert-description" className="sr-only">Description</label>
            <textarea id="cert-description" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} autoComplete="off" className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          </div>
          <div>
            <label htmlFor="cert-media" className="block text-sm font-medium text-off-white mb-1">Image (optionnel)</label>
            <input id="cert-media" type="file" accept="image/*" onChange={handleMediaChange} className="w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#222] file:text-off-white file:text-xs file:font-mono hover:file:bg-[#333]" />
            {mediaPreview && <img src={mediaPreview} alt="" className="mt-2 max-h-32 rounded object-contain border border-[#222]" />}
          </div>
          <button type="submit" disabled={saving} className="bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest">
            {saving ? 'Enregistrement...' : (editId ? 'Modifier' : 'Ajouter')}
          </button>
        </form>
      )}

      {isError ? (
        <div className="text-center py-16">
          <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur chargement</p>
          <button onClick={() => refetch()} className="bg-acid text-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-acid/90 transition-colors rounded">Réessayer</button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-[#222] rounded animate-pulse" />)}</div>
      ) : certifications.length === 0 ? (
        <EmptyState icon="" title="Aucune certification" message="Ajoutez vos certifications et diplômes complémentaires." actionLabel="Ajouter" onAction={() => { resetForm(); setShowForm(true); }} />
      ) : (
        <div className="space-y-3">
          {certifications.map((c) => (
            <div key={c.id} className="bg-[#111] p-4 rounded border border-[#222] flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-off-white">{c.titre}</h3>
                  <span className="text-sm text-muted">{c.organisme}</span>
                </div>
                <p className="text-xs text-muted mt-1">
                  {new Date(c.date_obtention).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                </p>
                {c.description && <p className="text-sm text-muted mt-2 line-clamp-2">{c.description}</p>}
                {c.medias?.length > 0 && (
                  <img src={c.medias[0].chemin_fichier} alt="" className="mt-2 max-h-24 rounded object-contain border border-[#222]" />
                )}
                {c.url_credential && <a href={c.url_credential} target="_blank" rel="noopener noreferrer" className="text-sm text-acid hover:underline mt-1 inline-block">Voir le justificatif ↗</a>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(c)} className="text-sm text-acid hover:text-acid/80" aria-label="Modifier">Modifier</button>
                <button onClick={() => setConfirmDelete(c.id)} className="text-sm text-red-400 hover:text-red-300" aria-label="Supprimer">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer la certification" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteCert.mutateAsync(confirmDelete); toast.success('Certification supprimée'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
