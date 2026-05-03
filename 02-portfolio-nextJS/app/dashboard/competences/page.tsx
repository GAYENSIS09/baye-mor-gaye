'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useCompetences } from '@/hooks/queries';
import { useCreateCompetence, useDeleteCompetence, useUpdateCompetence } from '@/hooks/mutations';
import { useToast } from '@/contexts/ToastContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import CompetenceBar from '@/components/CompetenceBar';
import type { Competence } from '@/types/api';
import { LoadingScreen } from '@/components/LoadingScreen';

const NIVEAUX = ['debutant', 'intermediaire', 'avance', 'expert'];

export default function SkillsPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const [nom, setNom] = useState('');
  const [categorie, setCategorie] = useState('');
  const [niveau, setNiveau] = useState('debutant');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNiveau, setEditNiveau] = useState('');
  const { data: competences = [], isLoading, isError, refetch } = useCompetences();
  const createCompetence = useCreateCompetence();
  const deleteCompetence = useDeleteCompetence();
  const updateCompetence = useUpdateCompetence();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createCompetence.mutateAsync({ nom, categorie: categorie || undefined, niveau });
      toast.success('Compétence ajoutée');
      setNom('');
      setCategorie('');
      setNiveau('debutant');
    } catch {
      toast.error("Erreur lors de l'ajout");
    }
  }

  function startEdit(c: Competence) {
    setEditingId(c.id);
    setEditNiveau(c.niveaux[0]?.niveau || 'debutant');
  }

  async function saveEdit(id: number) {
    try {
      await updateCompetence.mutateAsync({ id, niveau: editNiveau });
      toast.success('Niveau mis à jour');
      setEditingId(null);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-off-white">Compétences</h1>

      <form onSubmit={handleSubmit} className="bg-[#111] p-4 rounded border border-[#222] mb-6 space-y-3">
        <h2 className="font-semibold text-off-white">Nouvelle compétence</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input id="skills-nom" name="nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom" required autoComplete="off"
            className="border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          <input id="skills-categorie" name="categorie" value={categorie} onChange={(e) => setCategorie(e.target.value)} placeholder="Catégorie (optionnelle)" autoComplete="off"
            className="border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          <select id="skills-niveau" name="niveau" value={niveau} onChange={(e) => setNiveau(e.target.value)}
            className="border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50">
            {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <button type="submit" className="bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 font-mono text-xs uppercase tracking-widest">
          Ajouter
        </button>
      </form>

      {isError ? (
        <div className="text-center py-16">
          <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur chargement compétences</p>
          <button onClick={() => refetch()} className="bg-acid text-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-acid/90 transition-colors rounded">
            Réessayer
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-[#222] rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-1 bg-[#111] rounded border border-[#222] p-2">
          {competences.map((c) => {
            const niveauActuel = c.niveaux[0]?.niveau || 'debutant';
            const isEditing = editingId === c.id;
            return (
              <div key={c.id} className="flex items-center gap-2 group">
                <div className="flex-1">
                  {isEditing ? (
                    <div className="flex items-center gap-2 px-3 py-2">
                      <span className="text-sm text-off-white min-w-[120px] font-mono">{c.nom}</span>
                      <select value={editNiveau} onChange={(e) => setEditNiveau(e.target.value)}
                        className="border border-[#333] rounded px-2 py-1 bg-[#111] text-off-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50">
                        {NIVEAUX.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <button onClick={() => saveEdit(c.id)}
                        className="text-xs text-acid font-mono hover:text-acid/80 transition-colors">
                        Sauver
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="text-xs text-muted font-mono hover:text-off-white transition-colors">
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <CompetenceBar name={c.nom} niveau={niveauActuel} />
                  )}
                </div>
                {!isEditing && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                    <button onClick={() => startEdit(c)}
                      className="text-xs text-muted hover:text-off-white font-mono transition-colors">
                      Niveau
                    </button>
                    <button onClick={() => setConfirmDelete(c.id)}
                      className="text-xs text-red-400 hover:text-red-300 font-mono transition-colors">
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {competences.length === 0 && <div className="text-center py-12"><svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-muted font-mono text-sm">Aucune compétence.</p></div>}
        </div>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer la compétence" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteCompetence.mutateAsync(confirmDelete); toast.success('Compétence supprimée'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
