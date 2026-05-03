'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useFormations } from '@/hooks/queries';
import { useCreateFormation, useUpdateFormation, useDeleteFormation } from '@/hooks/mutations';
import { Formation } from '@/types/api';
import { useToast } from '@/contexts/ToastContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import { LoadingScreen } from '@/components/LoadingScreen';

interface FormData {
  diplome: string; etablissement: string; description: string;
  domaine_etude: string; date_debut: string; date_fin: string; ordre: number;
}

const emptyForm = (): FormData => ({
  diplome: '', etablissement: '', description: '', domaine_etude: '', date_debut: '', date_fin: '', ordre: 0,
});

export default function FormationsPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const { data: formations = [], isLoading, isError, refetch } = useFormations();
  const createForm = useCreateFormation();
  const updateForm = useUpdateFormation();
  const deleteForm = useDeleteFormation();
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
      const payload = { ...form, description: form.description || undefined, domaine_etude: form.domaine_etude || undefined, date_fin: form.date_fin || undefined };
      if (mediaFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => { if (v !== undefined) fd.append(k, String(v)); });
        fd.append('media', mediaFile);
        if (editId) {
          fd.append('_method', 'PUT');
          await updateForm.mutateAsync(fd as any);
        } else {
          await createForm.mutateAsync(fd as any);
        }
      } else {
        if (editId) {
          await updateForm.mutateAsync({ id: editId, ...payload });
        } else {
          await createForm.mutateAsync(payload);
        }
      }
      toast.success(editId ? 'Formation modifiée' : 'Formation ajoutée');
      resetForm();
    } catch { toast.error("Erreur lors de l'enregistrement"); }
    finally { setSaving(false); }
  }

  function startEdit(f: Formation) {
    const ext = f as Formation & { ordre?: number };
    setForm({ diplome: f.diplome, etablissement: f.etablissement, description: f.description || '', domaine_etude: f.domaine_etude || '', date_debut: f.date_debut?.split('T')[0] || '', date_fin: f.date_fin?.split('T')[0] || '', ordre: ext.ordre ?? 0 });
    setEditId(f.id);
    setShowForm(true);
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-off-white">Formations</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className={`px-4 py-2 rounded font-mono text-xs uppercase tracking-widest transition-colors ${showForm ? 'bg-[#222] text-off-white' : 'bg-acid text-black hover:bg-acid/90'}`}>
          {showForm ? 'Annuler' : 'Nouvelle formation'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#111] p-4 rounded border border-[#222] mb-6 space-y-3">
          <h2 className="font-semibold text-off-white">{editId ? 'Modifier' : 'Nouvelle'} formation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="form-diplome" className="sr-only">Diplôme</label>
              <input id="form-diplome" name="diplome" value={form.diplome} onChange={(e) => setForm({ ...form, diplome: e.target.value })} placeholder="Diplôme *" required autoComplete="off" className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            </div>
            <div>
              <label htmlFor="form-etablissement" className="sr-only">Établissement</label>
              <input id="form-etablissement" name="etablissement" value={form.etablissement} onChange={(e) => setForm({ ...form, etablissement: e.target.value })} placeholder="Établissement *" required autoComplete="off" className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            </div>
            <div>
              <label htmlFor="form-domaine" className="sr-only">Domaine d'étude</label>
              <input id="form-domaine" name="domaine_etude" value={form.domaine_etude} onChange={(e) => setForm({ ...form, domaine_etude: e.target.value })} placeholder="Domaine d'étude" autoComplete="off" className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            </div>
            <div>
              <label htmlFor="form-ordre" className="sr-only">Ordre</label>
              <input id="form-ordre" name="ordre" type="number" min="0" value={form.ordre} onChange={(e) => setForm({ ...form, ordre: parseInt(e.target.value) || 0 })} placeholder="Ordre" className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            </div>
            <div>
              <label htmlFor="form-date-debut" className="sr-only">Date début</label>
              <input id="form-date-debut" name="date_debut" type="date" value={form.date_debut} onChange={(e) => setForm({ ...form, date_debut: e.target.value })} required className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            </div>
            <div>
              <label htmlFor="form-date-fin" className="sr-only">Date fin</label>
              <input id="form-date-fin" name="date_fin" type="date" value={form.date_fin} onChange={(e) => setForm({ ...form, date_fin: e.target.value })} className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            </div>
          </div>
          <div>
            <label htmlFor="form-description" className="sr-only">Description</label>
            <textarea id="form-description" name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} autoComplete="off" className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          </div>
          <div>
            <label htmlFor="form-media" className="block text-sm font-medium text-off-white mb-1">Image (optionnel)</label>
            <input id="form-media" type="file" accept="image/*" onChange={handleMediaChange} className="w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#222] file:text-off-white file:text-xs file:font-mono hover:file:bg-[#333]" />
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
      ) : formations.length === 0 ? (
        <EmptyState icon="" title="Aucune formation" message="Ajoutez votre parcours académique." actionLabel="Ajouter" onAction={() => { resetForm(); setShowForm(true); }} />
      ) : (
        <div className="space-y-3">
          {formations.map((f) => (
            <div key={f.id} className="bg-[#111] p-4 rounded border border-[#222] flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-off-white">{f.diplome}</h3>
                  <span className="text-sm text-muted">{f.etablissement}</span>
                </div>
                {f.domaine_etude && <p className="text-sm text-muted">{f.domaine_etude}</p>}
                <p className="text-xs text-muted mt-1">
                  {new Date(f.date_debut).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })} — {f.date_fin ? new Date(f.date_fin).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : 'En cours'}
                </p>
                {f.description && <p className="text-sm text-muted mt-2 line-clamp-2">{f.description}</p>}
                {f.medias?.length > 0 && (
                  <img src={f.medias[0].chemin_fichier} alt="" className="mt-2 max-h-24 rounded object-contain border border-[#222]" />
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(f)} className="text-sm text-acid hover:text-acid/80" aria-label="Modifier">Modifier</button>
                <button onClick={() => setConfirmDelete(f.id)} className="text-sm text-red-400 hover:text-red-300" aria-label="Supprimer">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer la formation" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteForm.mutateAsync(confirmDelete); toast.success('Formation supprimée'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
