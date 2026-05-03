'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import { useProjects } from '@/hooks/queries';
import { useDeleteProjet } from '@/hooks/mutations';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import Pagination from '@/components/Pagination';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { Projet } from '@/types/api';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function ProjetsDashboardPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [techFilter, setTechFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const params: Record<string, string> = { page: String(currentPage) };
  if (search) params.search = search;
  if (techFilter) params.technologie = techFilter;
  if (statutFilter) params.statut = statutFilter;

  const { data: projetsResponse, isLoading, isError, refetch } = useProjects(params);
  const deleteProjet = useDeleteProjet();

  const togglePublier = useMutation({
    mutationFn: ({ id, est_publie }: { id: number; est_publie: boolean }) =>
      api.put(`/projets/${id}`, { est_publie }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.projets() }),
  });

  const projets = projetsResponse?.data ?? [];
  const lastPage = projetsResponse?.last_page ?? 1;
  const total = projetsResponse?.total ?? 0;

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  function handleTogglePublier(p: Projet) {
    togglePublier.mutate({ id: p.id, est_publie: !p.est_publie });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteProjet.mutateAsync(deleteTarget);
    setDeleteTarget(null);
    refetch();
  }

  const allTechs = [...new Set(projets.flatMap((p: Projet) => p.technologies ?? []))].sort();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-off-white">Projets</h1>
        <Link href="/dashboard/projets/new"
          className="bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 font-mono text-xs uppercase tracking-widest">
          Nouveau projet
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder="Rechercher par titre..."
          className="flex-1 min-w-[200px] bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-off-white placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        <select value={techFilter} onChange={(e) => { setTechFilter(e.target.value); setCurrentPage(1); }}
          className="bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-off-white focus-visible:outline-none">
          <option value="">Toutes technos</option>
          {allTechs.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statutFilter} onChange={(e) => { setStatutFilter(e.target.value); setCurrentPage(1); }}
          className="bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-off-white focus-visible:outline-none">
          <option value="">Tous statuts</option>
          <option value="publie">Publié</option>
          <option value="brouillon">Brouillon</option>
        </select>
      </div>

      {isError ? (
        <div className="text-center py-16">
          <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur chargement projets</p>
          <button onClick={() => refetch()} className="bg-acid text-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-acid/90 transition-colors rounded">
            Réessayer
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-[#222] rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-4">
          {projets.map((p) => (
            <div key={p.id} className="bg-[#111] p-4 rounded border border-[#222] flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-off-white">{p.titre}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${p.est_publie ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
                    {p.est_publie ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
                {p.technologies && p.technologies.length > 0 && (
                  <p className="text-sm text-muted truncate">{p.technologies.join(', ')}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <button onClick={() => handleTogglePublier(p)}
                  className="text-xs text-acid hover:text-acid/80 font-mono transition-colors">
                  {p.est_publie ? 'Archiver' : 'Publier'}
                </button>
                <Link href={`/dashboard/projets/${p.id}/edit`}
                  className="text-xs text-muted hover:text-off-white font-mono transition-colors">
                  Modifier
                </Link>
                <button onClick={() => setDeleteTarget(p.id)}
                  className="text-xs text-red-400 hover:text-red-300 font-mono transition-colors">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
          {projets.length === 0 && <div className="text-center py-12"><svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-muted font-mono text-sm">Aucun projet trouvé.</p></div>}
        </div>
      )}
      <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />

      <ConfirmDialog
        open={deleteTarget !== null}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Supprimer le projet"
        message="Cette action est irreversible."
      />
    </div>
  );
}
