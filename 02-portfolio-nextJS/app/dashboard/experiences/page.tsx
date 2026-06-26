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
import { getMediaUrl } from '@/lib/media';
import { ApiError } from '@/lib/api';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Skeleton } from '@/components/Skeleton';
import { Icons } from '@/components/ui/Icons';
import { SectionHeader } from '@/components/SectionHeader';
import { ActionButton, ActionBar, IconButton } from '@/components/ActionBar';

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

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
  const [existingMedia, setExistingMedia] = useState<{ id: number; chemin: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [removeMedia, setRemoveMedia] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(ExperienceFormSchema),
    defaultValues: {
      titre: '', entreprise: '', description: '', lieu: '', date_debut: '', date_fin: '', est_actuel: false,
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
    setExistingMedia(null);
    setRemoveMedia(false);
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
      const payload = { ...data, date_fin: data.est_actuel ? '' : (data.date_fin || undefined) };

      if (mediaFile) {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : String(v)); });
        fd.append('media', mediaFile);
        if (editId) {
          fd.append('_method', 'PUT');
          fd.append('id', String(editId));
          await updateExp.mutateAsync(fd);
        } else {
          await createExp.mutateAsync(fd);
        }
      } else if (editId) {
        await updateExp.mutateAsync({ id: editId, ...payload, media_id: existingMedia?.id, supprimer_media: removeMedia });
      } else {
        await createExp.mutateAsync(payload);
      }
      toast.success(editId ? 'Expérience modifiée' : 'Expérience ajoutée');
      resetForm();
    } catch (e) { toast.error(e instanceof ApiError ? e.message : "Erreur lors de l'enregistrement"); }
    finally { setSaving(false); }
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
      setMediaPreview(getMediaUrl(exp.medias[0].chemin_fichier, exp.medias[0].id) || '');
      setExistingMedia({ id: exp.medias[0].id, chemin: exp.medias[0].chemin_fichier || '' });
    } else {
      setMediaPreview('');
      setExistingMedia(null);
    }
    setMediaFile(null);
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <SectionHeader
        title="Expériences"
        actions={
          <ActionButton variant="primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
            {showForm ? 'Annuler' : editId ? 'Ajouter' : 'Nouvelle expérience'}
          </ActionButton>
        }
      />

      {showForm && (
        <div className="w-full bg-[#111] border border-[#222] rounded-lg p-4 mb-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
            <h3 className="font-body font-semibold text-off-white text-base">{editId ? 'Modifier' : 'Nouvelle'} expérience</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input id="exp-titre" {...register("titre")} placeholder="Titre *" required autoComplete="off" className="input-base" />
                {errors.titre && <p className="text-red-400 text-xs mt-1">{errors.titre.message}</p>}
              </div>
              <div>
                <input id="exp-entreprise" {...register("entreprise")} placeholder="Entreprise *" required autoComplete="off" className="input-base" />
                {errors.entreprise && <p className="text-red-400 text-xs mt-1">{errors.entreprise.message}</p>}
              </div>
              <div>
                <input id="exp-lieu" {...register("lieu")} placeholder="Lieu" autoComplete="off" className="input-base" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="exp-actuel" {...register("est_actuel")} className="accent-acid" />
                <label htmlFor="exp-actuel" className="text-sm text-off-white">Poste actuel</label>
              </div>
              <div>
                <input id="exp-date-debut" type="date" {...register("date_debut")} required className="input-base" />
                {errors.date_debut && <p className="text-red-400 text-xs mt-1">{errors.date_debut.message}</p>}
              </div>
              <div>
                <input id="exp-date-fin" type="date" {...register("date_fin")} disabled={estActuel} className="input-base disabled:opacity-40" />
              </div>
            </div>
            <div>
              <textarea id="exp-description" {...register("description")} placeholder="Description" rows={3} autoComplete="off" className="input-base" />
            </div>
            <div>
              <label htmlFor="exp-media" className="label-base">Image (optionnel)</label>
              <input id="exp-media" type="file" accept="image/*" onChange={handleMediaChange} className="w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#222] file:text-off-white file:text-xs file:font-mono hover:file:bg-[#333]" />
              {editId && existingMedia && !mediaFile && (
                <p className="text-xs text-muted mt-1 font-mono">Fichier actuel : {existingMedia.chemin.split('/').pop()}</p>
              )}
              {editId && existingMedia && !mediaFile && !removeMedia && (
                <button type="button" onClick={() => { setRemoveMedia(true); setMediaPreview(''); }} className="text-xs text-red-400 hover:text-red-300 mt-1 underline">Supprimer l'image</button>
              )}
              {removeMedia && <p className="text-xs text-amber-400 mt-1">L'image sera supprimée à l'enregistrement.</p>}
              {mediaPreview && <img src={mediaPreview} alt="" className="mt-2 max-h-32 rounded object-contain border border-[#222]" />}
            </div>
            <ActionButton type="submit" disabled={saving || isSubmitting} variant="primary">
              {saving || isSubmitting ? 'Enregistrement...' : (editId ? 'Modifier' : 'Ajouter')}
            </ActionButton>
          </form>
        </div>
      )}

      {isError ? (
        <div className="text-center py-16">
          <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur chargement</p>
          <ActionButton variant="primary" onClick={() => refetch()}>Réessayer</ActionButton>
        </div>
      ) : isLoading ? (
        <div className="space-y-0">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="group relative py-8 border-t border-[#222] animate-pulse">
              <div className="grid md:grid-cols-[200px_1fr] gap-6 md:gap-12">
                <Skeleton className="h-4 w-24 rounded" />
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48 rounded" />
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-16 w-full rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : experiences.length === 0 ? (
        <EmptyState icon="⚡" title="Aucune expérience" message="Ajoutez votre première expérience professionnelle." actionLabel="Ajouter" onAction={() => { resetForm(); setShowForm(true); }} />
      ) : (
        <div className="space-y-0">
          {experiences.map((exp, idx) => (
            <div key={exp.id} className="group relative py-8 border-t border-[#222] hover:border-acid/40 transition-colors duration-300">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-acid scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
              <div className="grid md:grid-cols-[200px_1fr] gap-6 md:gap-12">
                <div className="self-start">
                  <p className="font-mono text-xs text-muted uppercase tracking-widest">
                    {formatDate(exp.date_debut)} — {exp.est_actuel ? "Présent" : (exp.date_fin ? formatDate(exp.date_fin) : "")}
                  </p>
                </div>
                <div>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-off-white text-xl font-body font-medium">{exp.titre}</h3>
                          <p className="text-acid font-mono text-sm mt-1">{exp.entreprise}</p>
                        </div>
                        <span className="tag shrink-0">Expérience</span>
                      </div>
                      {exp.lieu && <p className="text-sm text-muted mb-2">{exp.lieu}</p>}
                      {exp.description && <p className="text-muted text-sm leading-relaxed">{exp.description}</p>}
                      {exp.medias?.length > 0 && (
                        <div className="mt-3 relative w-full md:w-80 h-40 rounded overflow-hidden border border-[#222]">
                          <MediaViewer src={getMediaUrl(exp.medias[0].chemin_fichier, exp.medias[0].id) ?? ''} alt="" fill className="object-cover" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0 mt-1">
                      <IconButton onClick={() => startEdit(exp)} icon={<Icons.edit className="w-4 h-4" />} label="Modifier" variant="ghost" size="sm" />
                      <IconButton onClick={() => setConfirmDelete(exp.id)} icon={<Icons.trash className="w-4 h-4" />} label="Supprimer" variant="danger" size="sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer l'expérience" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteExp.mutateAsync(confirmDelete); toast.success('Expérience supprimée'); } catch (e) { toast.error(e instanceof ApiError ? e.message : 'Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
