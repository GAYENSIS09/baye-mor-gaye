'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CompetenceFormSchema, type CompetenceFormData } from '@/schemas/forms';
import { useCompetences } from '@/hooks/queries';
import { useCreateCompetence, useDeleteCompetence, useUpdateCompetence } from '@/hooks/mutations';
import { useToast } from '@/contexts/ToastContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import CompetenceBar from '@/components/CompetenceBar';
import type { Competence } from '@/types/api';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Skeleton } from '@/components/Skeleton';
import { Icons } from '@/components/ui/Icons';
import { SectionHeader } from '@/components/SectionHeader';
import { ActionButton, IconButton } from '@/components/ActionBar';

const NIVEAUX = ['debutant', 'intermediaire', 'avance', 'expert'];

export default function SkillsPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNiveau, setEditNiveau] = useState('');
  const [editNom, setEditNom] = useState('');
  const [editCategorie, setEditCategorie] = useState('');
  const [EditIcone, setEditIcone] = useState('');
  const [editEstSurligne, setEditEstSurligne] = useState(false);
  const { data: competences = [], isLoading, isError, refetch } = useCompetences();
  const createCompetence = useCreateCompetence();
  const deleteCompetence = useDeleteCompetence();
  const updateCompetence = useUpdateCompetence();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [filter, setFilter] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CompetenceFormData>({
    resolver: zodResolver(CompetenceFormSchema),
    defaultValues: { nom: '', categorie: '', icone: '', niveau: 'debutant', est_surligne: false },
  });

  const categories = useMemo(() => {
    const cats = new Set<string>();
    competences.forEach((c) => cats.add(c.categorie || 'Autre'));
    return Array.from(cats).sort();
  }, [competences]);

  const grouped = useMemo(() => {
    const groups = competences.reduce<{ categorie: string; skills: Competence[] }[]>((acc, comp) => {
      const cat = comp.categorie || 'Autre';
      if (filter && cat !== filter) return acc;
      let group = acc.find((g) => g.categorie === cat);
      if (!group) {
        group = { categorie: cat, skills: [] };
        acc.push(group);
      }
      group.skills.push(comp);
      return acc;
    }, []);
    return groups.sort((a, b) => categories.indexOf(a.categorie) - categories.indexOf(b.categorie));
  }, [competences, filter, categories]);

  function resetForm() {
    reset({ nom: '', categorie: '', icone: '', niveau: 'debutant', est_surligne: false });
  }

  async function onSubmit(data: CompetenceFormData) {
    try {
      await createCompetence.mutateAsync(data);
      toast.success('Compétence ajoutée');
      resetForm();
      setShowForm(false);
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  }

  function startEdit(c: Competence) {
    setEditingId(c.id);
    setEditNiveau(c.niveaux[0]?.niveau || 'debutant');
    setEditNom(c.nom);
    setEditCategorie(c.categorie || '');
    setEditIcone(c.icone || '');
    setEditEstSurligne(c.niveaux[0]?.est_surligne ?? false);
  }

  async function saveEdit(id: number) {
    try {
      await updateCompetence.mutateAsync({
        id,
        nom: editNom,
        categorie: editCategorie || undefined,
        icone: EditIcone || undefined,
        niveau: editNiveau,
        est_surligne: editEstSurligne,
      });
      toast.success('Compétence mise à jour');
      setEditingId(null);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <SectionHeader
        title="Compétences"
        actions={
          <ActionButton variant="primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : 'Nouvelle compétence'}
          </ActionButton>
        }
      />

      {showForm && (
        <div className="bg-[#111] border border-[#222] rounded-lg p-4 mb-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
            <h3 className="font-body font-semibold text-off-white text-base">Nouvelle compétence</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <input id="skills-nom" {...register("nom")} placeholder="Nom *" required autoComplete="off" className="input-base" />
                {errors.nom && <p className="text-red-400 text-xs mt-1">{errors.nom.message}</p>}
              </div>
              <div>
                <input id="skills-categorie" {...register("categorie")} placeholder="Catégorie" autoComplete="off" className="input-base" />
              </div>
              <div>
                <input id="skills-icone" {...register("icone")} placeholder="Icône (emoji ou URL)" autoComplete="off" className="input-base" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <select id="skills-niveau" {...register("niveau")} className="input-base">
                  {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                {errors.niveau && <p className="text-red-400 text-xs mt-1">{errors.niveau.message}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="skills-surligne" {...register("est_surligne")} className="accent-acid" />
                <label htmlFor="skills-surligne" className="text-sm text-off-white">Surligné</label>
              </div>
            </div>
            <ActionButton type="submit" disabled={isSubmitting} variant="primary">
              {isSubmitting ? 'Ajout...' : 'Ajouter'}
            </ActionButton>
          </form>
        </div>
      )}

      {isError ? (
        <div className="text-center py-16">
          <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur chargement compétences</p>
          <ActionButton variant="primary" onClick={() => refetch()}>Réessayer</ActionButton>
        </div>
      ) : isLoading ? (
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <Skeleton className="h-4 w-24 rounded mb-4" />
              <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden">
                <div className="p-3 space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Skeleton key={j} className="h-10 w-full rounded" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {categories.length > 1 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              <button onClick={() => setFilter('')}
                className={`px-3 py-1.5 rounded font-mono text-xs uppercase tracking-widest transition-colors ${
                  !filter ? 'bg-acid text-black' : 'bg-[#222] text-muted hover:text-off-white'
                }`}>
                Toutes
              </button>
              {categories.map((cat) => (
                <button key={cat} onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 rounded font-mono text-xs uppercase tracking-widest transition-colors ${
                    filter === cat ? 'bg-acid text-black' : 'bg-[#222] text-muted hover:text-off-white'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {grouped.length === 0 ? (
            <div className="text-center py-16">
              <Icons.file className="w-10 h-10 mx-auto text-muted/30 mb-3" aria-hidden />
              <p className="text-muted font-mono text-sm">Aucune compétence à afficher.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {grouped.map((group) => (
                <div key={group.categorie}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-mono text-xs text-acid uppercase tracking-widest">{group.categorie}</h3>
                    <span className="text-xs text-muted font-mono">{group.skills.length}</span>
                  </div>
                  <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden divide-y divide-[#222]">
                    {group.skills.map((skill) => {
                      const niveauActuel = skill.niveaux[0]?.niveau || 'debutant';
                      const isEditing = editingId === skill.id;
                      return (
                        <div key={skill.id} className="group relative">
                          {isEditing ? (
                            <div className="flex flex-wrap items-center gap-2 px-3 py-2">
                              <input value={editNom} onChange={(e) => setEditNom(e.target.value)}
                                className="w-32 border border-[#333] rounded px-2 py-1 bg-[#111] text-off-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
                              <input value={editCategorie} onChange={(e) => setEditCategorie(e.target.value)} placeholder="Catégorie"
                                className="w-28 border border-[#333] rounded px-2 py-1 bg-[#111] text-off-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
                              <input value={EditIcone} onChange={(e) => setEditIcone(e.target.value)} placeholder="Icône"
                                className="w-20 border border-[#333] rounded px-2 py-1 bg-[#111] text-off-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
                              <select value={editNiveau} onChange={(e) => setEditNiveau(e.target.value)}
                                className="border border-[#333] rounded px-2 py-1 bg-[#111] text-off-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50">
                                {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
                              </select>
                              <label className="flex items-center gap-1 text-xs text-muted cursor-pointer">
                                <input type="checkbox" checked={editEstSurligne} onChange={(e) => setEditEstSurligne(e.target.checked)} className="accent-acid" />
                                Surligné
                              </label>
                              <ActionButton size="sm" onClick={() => saveEdit(skill.id)} variant="primary">Sauver</ActionButton>
                              <ActionButton size="sm" onClick={() => setEditingId(null)} variant="ghost">Annuler</ActionButton>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <div className="flex-1">
                                <CompetenceBar
                                  name={skill.nom}
                                  niveau={niveauActuel}
                                  surligne={skill.niveaux[0]?.est_surligne}
                                  icone={skill.icone}
                                />
                              </div>
                              <div className="flex items-center gap-1 pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <IconButton onClick={() => startEdit(skill)} icon={<Icons.edit className="w-4 h-4" />} label="Niveau" variant="ghost" size="sm" />
                                <IconButton onClick={() => setConfirmDelete(skill.id)} icon={<Icons.trash className="w-4 h-4" />} label="Supprimer" variant="danger" size="sm" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer la compétence" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteCompetence.mutateAsync(confirmDelete); toast.success('Compétence supprimée'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
