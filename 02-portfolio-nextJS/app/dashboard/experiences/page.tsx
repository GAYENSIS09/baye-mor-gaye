'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExperienceFormSchema, type ExperienceFormData } from '@/schemas/forms';
import { useExperiences } from '@/hooks/queries';
import { useCreateExperience, useUpdateExperience, useDeleteExperience } from '@/hooks/mutations';
import { Experience } from '@/types/api';
import { useToast } from '@/contexts/ToastContext';
import MediaViewer from '@/components/MediaViewer';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Icons } from '@/components/ui/Icons';

export default function ExperiencesPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const { data: experiences = [], isLoading, isError, refetch } = useExperiences();
  const createExp = useCreateExperience();
  const updateExp = useUpdateExperience();
  const deleteExp = useDeleteExperience();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(ExperienceFormSchema),
    defaultValues: {
      titre: '',
      entreprise: '',
      description: '',
      lieu: '',
      date_debut: '',
      date_fin: '',
      est_actuel: false,
    },
  });

  const estActuel = watch('est_actuel');

  function resetForm() {
    reset({
      titre: '', entreprise: '', description: '', lieu: '', date_debut: '', date_fin: '', est_actuel: false,
    });
    setEditId(null);
    setShowForm(false);
    setMediaFile(null);
    setMediaPreview('');
  }

  function handleMediaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setMediaFile(f);
    const reader = new FileReader();
    reader.onload = () => setMediaPreview(reader.result as string);
    reader.readAsDataURL(f);
  }

  async function onSubmit(data: ExperienceFormData) {
    setSaving(true);
    try {
      const payload = { ...data, date_fin: data.est_actuel ? null : (data.date_fin || undefined) };
      if (mediaFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => { if (v !== undefined) fd.append(k, String(v)); });
        fd.append('media', mediaFile);
        if (editId) {
          fd.append('_method', 'PUT');
          fd.append('id', String(editId));
          await updateExp.mutateAsync(fd);
        } else {
          await createExp.mutateAsync(fd);
        }
      } else {
        if (editId) {
          await updateExp.mutateAsync({ id: editId, ...payload });
        } else {
          await createExp.mutateAsync(payload);
        }
      }
      toast.success(editId ? 'Expérience modifiée' : 'Expérience ajoutée');
      resetForm();
    } catch { toast.error("Erreur lors de l'enregistrement"); }
    finally { setSaving(false); }
  }

  const STORAGE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '/storage') || 'http://localhost:8000/storage';

  function getMediaUrl(path: string | null | undefined): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${STORAGE_URL}/${path.replace(/^\//, '')}`;
  }

  function startEdit(exp: Experience) {
    reset({
      titre: exp.titre,
      entreprise: exp.entreprise,
      description: exp.description || '',
      date_debut: exp.date_debut?.split('T')[0] || '',
      date_fin: exp.date_fin?.split('T')[0] || '',
      lieu: exp.lieu || '',
      est_actuel: exp.est_actuel,
    });
    setEditId(exp.id);
    setShowForm(true);
    if (exp.medias?.length > 0) {
      setMediaPreview(getMediaUrl(exp.medias[0].chemin_fichier) || '');
    } else {
      setMediaPreview('');
    }
    setMediaFile(null);
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-off-white">Expériences</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className={`px-4 py-2 rounded font-mono text-xs uppercase tracking-widest transition-colors ${showForm ? 'bg-[#222] text-off-white' : 'bg-acid text-black hover:bg-acid/90'}`}>
          {showForm ? 'Annuler' : editId ? 'Ajouter' : 'Nouvelle expérience'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="bg-[#111] p-4 rounded border border-[#222] mb-6 space-y-3">
          <h2 className="font-semibold text-off-white">{editId ? 'Modifier' : 'Nouvelle'} expérience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="exp-titre" className="sr-only">Titre</label>
              <input id="exp-titre" {...register("titre")} placeholder="Titre *" required autoComplete="off" className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
              {errors.titre && <p className="text-red-400 text-xs mt-1">{errors.titre.message}</p>}
            </div>
            <div>
              <label htmlFor="exp-entreprise" className="sr-only">Entreprise</label>
              <input id="exp-entreprise" {...register("entreprise")} placeholder="Entreprise *" required autoComplete="off" className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
              {errors.entreprise && <p className="text-red-400 text-xs mt-1">{errors.entreprise.message}</p>}
            </div>
            <div>
              <label htmlFor="exp-lieu" className="sr-only">Lieu</label>
              <input id="exp-lieu" {...register("lieu")} placeholder="Lieu" autoComplete="off" className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="exp-actuel" {...register("est_actuel")} className="accent-acid" />
              <label htmlFor="exp-actuel" className="text-sm text-off-white">Poste actuel</label>
            </div>
            <div>
              <label htmlFor="exp-date-debut" className="sr-only">Date début</label>
              <input id="exp-date-debut" type="date" {...register("date_debut")} required className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
              {errors.date_debut && <p className="text-red-400 text-xs mt-1">{errors.date_debut.message}</p>}
            </div>
            <div>
              <label htmlFor="exp-date-fin" className="sr-only">Date fin</label>
              <input id="exp-date-fin" type="date" {...register("date_fin")} disabled={estActuel} className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50 disabled:opacity-40" />
            </div>
          </div>
          <div>
            <label htmlFor="exp-description" className="sr-only">Description</label>
            <textarea id="exp-description" {...register("description")} placeholder="Description" rows={3} autoComplete="off" className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          </div>
          <div>
            <label htmlFor="exp-media" className="block text-sm font-medium text-off-white mb-1">Image (optionnel)</label>
            <input id="exp-media" type="file" accept="image/*" onChange={handleMediaChange} className="w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#222] file:text-off-white file:text-xs file:font-mono hover:file:bg-[#333]" />
            {mediaPreview && <img src={mediaPreview} alt="" className="mt-2 max-h-32 rounded object-contain border border-[#222]" />}
          </div>
          <button type="submit" disabled={saving || isSubmitting} className="bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest">
            {saving || isSubmitting ? 'Enregistrement...' : (editId ? 'Modifier' : 'Ajouter')}
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
      ) : experiences.length === 0 ? (
        <EmptyState icon="⚡" title="Aucune expérience" message="Ajoutez votre première expérience professionnelle." actionLabel="Ajouter" onAction={() => { resetForm(); setShowForm(true); }} />
      ) : (
        <div className="space-y-3">
          {experiences.map((exp) => (
            <div key={exp.id} className="bg-[#111] p-4 rounded border border-[#222] flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-off-white">{exp.titre}</h3>
                  <span className="text-sm text-muted">{exp.entreprise}</span>
                  {exp.est_actuel && <span className="text-xs bg-acid/10 text-acid px-2 py-0.5 rounded">En cours</span>}
                </div>
                {exp.lieu && <p className="text-sm text-muted">{exp.lieu}</p>}
                <p className="text-xs text-muted mt-1">
                  {new Date(exp.date_debut).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })} — {exp.est_actuel ? 'Aujourd\'hui' : (exp.date_fin ? new Date(exp.date_fin).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' }) : '')}
                </p>
                {exp.description && <p className="text-sm text-muted mt-2 line-clamp-2">{exp.description}</p>}
                {exp.medias?.length > 0 && (
                  <MediaViewer src={exp.medias[0].chemin_fichier} alt="" width={200} height={96} className="mt-2 max-h-24 rounded object-contain border border-[#222]" />
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(exp)} className="p-2 text-acid hover:text-acid/80 transition-colors rounded hover:bg-acid/10" aria-label="Modifier"><Icons.edit className="w-4 h-4" /></button>
                <button onClick={() => setConfirmDelete(exp.id)} className="p-2 text-red-400 hover:text-red-300 transition-colors rounded hover:bg-red-400/10" aria-label="Supprimer"><Icons.trash className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer l'expérience" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteExp.mutateAsync(confirmDelete); toast.success('Expérience supprimée'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
