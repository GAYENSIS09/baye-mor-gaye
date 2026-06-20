'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import { usePublications, useDomaines } from '@/hooks/queries';
import { useDeletePublication } from '@/hooks/mutations';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import { Domaine } from '@/types/api';
import Pagination from '@/components/Pagination';
import ConfirmDialog from '@/components/ConfirmDialog';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Icons } from '@/components/ui/Icons';

const TYPES = ['article', 'tutoriel', 'note'];

export default function PublicationsDashboardPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [domaineFilter, setDomaineFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const params: Record<string, string> = { page: String(currentPage) };
  if (typeFilter) params.type = typeFilter;
  if (domaineFilter) params.domaine = domaineFilter;
  if (statutFilter) params.statut = statutFilter;

  const { data: publicationsResponse, isLoading, isError, refetch } = usePublications(params);
  const { data: domainesData } = useDomaines();
  const domaines = domainesData ?? [];

  const deletePublication = useDeletePublication();

  const togglePublier = useMutation({
    mutationFn: ({ id, est_publie }: { id: number; est_publie: boolean }) =>
      api.put(`/publications/${id}`, { est_publie }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.publications() }),
  });

  const publications = publicationsResponse?.data ?? [];
  const lastPage = publicationsResponse?.last_page ?? 1;
  const total = publicationsResponse?.total ?? 0;

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  async function handleDelete() {
    if (!deleteTarget) return;
    await deletePublication.mutateAsync(deleteTarget);
    setDeleteTarget(null);
    refetch();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-off-white">Publications</h1>
        <Link href="/dashboard/publications/new"
          className="bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 font-mono text-xs uppercase tracking-widest">
          Nouvelle publication
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
          className="bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-off-white focus-visible:outline-none">
          <option value="">Tous types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={domaineFilter} onChange={(e) => { setDomaineFilter(e.target.value); setCurrentPage(1); }}
          className="bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-off-white focus-visible:outline-none">
          <option value="">Tous domaines</option>
          {domaines.map((d) => <option key={d.id} value={d.slug || d.id}>{d.nom}</option>)}
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
          <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur chargement publications</p>
          <button onClick={() => refetch()} className="bg-acid text-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-acid/90 transition-colors rounded">
            Réessayer
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-[#222] rounded animate-pulse" />)}</div>
      ) : (
        <div className="space-y-4">
          {publications.map((p) => (
            <div key={p.id} className="bg-[#111] p-4 rounded border border-[#222] flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-off-white truncate">{p.titre}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${p.est_publie ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
                    {p.est_publie ? 'Publié' : 'Brouillon'}
                  </span>
                  <span className="text-xs text-muted bg-[#222] px-2 py-0.5 rounded">{p.type}</span>
                </div>
                <p className="text-sm text-muted">
                  {p.publie_le ? new Date(p.publie_le).toLocaleDateString('fr-FR') : 'Non publié'}
                  {(p.domaines?.length ?? 0) > 0 && (
                    <span> — {p.domaines.map((d: Domaine, i) => (
                      <span key={d.id}>{i > 0 && ', '}<Link href="/dashboard/domaines" className="text-acid hover:underline">{d.nom}</Link></span>
                    ))}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <button onClick={() => togglePublier.mutate({ id: p.id, est_publie: !p.est_publie })}
                  className="text-xs text-acid hover:text-acid/80 font-mono transition-colors">
                  {p.est_publie ? 'Archiver' : 'Publier'}
                </button>
                <Link href={`/dashboard/publications/${p.id}/edit`}
                  className="p-2 text-acid hover:text-acid/80 transition-colors rounded hover:bg-acid/10" aria-label="Modifier">
                  <Icons.edit className="w-4 h-4" />
                </Link>
                <button onClick={() => setDeleteTarget(p.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors rounded hover:bg-red-400/10" aria-label="Supprimer">
                  <Icons.trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {publications.length === 0 && <div className="text-center py-12"><svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-muted font-mono text-sm">Aucune publication trouvée.</p></div>}
        </div>
      )}
      <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />

      <ConfirmDialog
        open={deleteTarget !== null}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Supprimer la publication"
        message="Cette action est irréversible."
      />
    </div>
  );
}
