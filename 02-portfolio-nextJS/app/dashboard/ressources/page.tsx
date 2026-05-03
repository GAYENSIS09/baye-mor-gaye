'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useRessources, useDomaines } from '@/hooks/queries';
import { useCreateRessource, useDeleteRessource } from '@/hooks/mutations';
import ConfirmDialog from '@/components/ConfirmDialog';
import { LoadingScreen } from '@/components/LoadingScreen';
import Pagination from '@/components/Pagination';

export default function RessourcesDashboardPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [titre, setTitre] = useState('');
  const [urlExterne, setUrlExterne] = useState('');
  const [type, setType] = useState<'fichier' | 'lien'>('lien');
  const [domaineId, setDomaineId] = useState('');
  const params: Record<string, string> = { page: String(currentPage) };
  const { data: ressourcesRes, isLoading, isError, refetch } = useRessources(params);
  const ressources = ressourcesRes?.data ?? [];
  const lastPage = ressourcesRes?.last_page ?? 1;
  const total = ressourcesRes?.total ?? 0;
  const { data: domaines = [] } = useDomaines();
  const createRessource = useCreateRessource();
  const deleteRessource = useDeleteRessource();
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createRessource.mutateAsync({
        titre,
        url_externe: type === 'lien' ? urlExterne : undefined,
        type,
        domaine_id: domaineId ? parseInt(domaineId) : undefined,
      });
      setTitre('');
      setUrlExterne('');
      setType('lien');
      setDomaineId('');
      setShowForm(false);
      setSaving(false);
    } catch {
      console.error('Erreur creation');
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteRessource.mutateAsync(id);
    } catch {
      console.error('Erreur suppression');
    }
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-off-white">Ressources</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 font-mono text-xs uppercase tracking-widest">
          {showForm ? 'Annuler' : 'Nouvelle ressource'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#111] p-4 rounded border border-[#222] mb-6 space-y-3">
          <input name="titre" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Titre" required autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          <div className="flex gap-3">
            <select name="type" value={type} onChange={(e) => setType(e.target.value as 'fichier' | 'lien')}
              className="border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50">
              <option value="lien">Lien</option>
              <option value="fichier">Fichier</option>
            </select>
            <input name="url_externe" value={urlExterne} onChange={(e) => setUrlExterne(e.target.value)}
              placeholder="URL" type="url" autoComplete="url"
              className="flex-1 border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          </div>
          <select name="domaine_id" value={domaineId} onChange={(e) => setDomaineId(e.target.value)}
            className="w-full border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50">
            <option value="">Sans domaine</option>
            {domaines.map((d) => (
              <option key={d.id} value={d.id}>{d.nom}</option>
            ))}
          </select>
          <button type="submit" disabled={saving} className="bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest">
            {saving ? 'Ajout...' : 'Ajouter'}
          </button>
        </form>
      )}

      {isError ? (
        <div className="text-center py-16">
          <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur chargement ressources</p>
          <button onClick={() => refetch()} className="bg-acid text-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-acid/90 transition-colors rounded">
            Réessayer
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-[#222] rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {ressources.map((r) => (
            <div key={r.id} className="bg-[#111] p-4 rounded border border-[#222] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-off-white">{r.titre}</p>
                  <span className="text-xs bg-[#222] text-muted px-2 py-0.5 rounded">{r.type}</span>
                  {r.domaine && (
                    <span className="text-xs bg-acid/10 text-acid px-2 py-0.5 rounded">{r.domaine.nom}</span>
                  )}
                </div>
                {r.url_externe && (
                  <a href={r.url_externe} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-acid hover:underline">
                    {r.url_externe}
                  </a>
                )}
              </div>
              <button onClick={() => setConfirmDelete(r.id)} aria-label={`Supprimer ${r.titre}`}
                className="text-red-400 hover:text-red-300 text-sm">
                Supprimer
              </button>
            </div>
          ))}
          {ressources.length === 0 && <div className="text-center py-12"><svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-muted font-mono text-sm">Aucune ressource.</p></div>}
        </div>
      )}

      <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer la ressource" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteRessource.mutateAsync(confirmDelete); } catch { console.error('Erreur'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
