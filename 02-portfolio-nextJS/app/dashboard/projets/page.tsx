'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useProjects } from '@/hooks/queries';
import { useDeleteProjet } from '@/hooks/mutations';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import { Pagination } from '@/components/ActionBar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import type { Projet } from '@/types/api';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Icons } from '@/components/ui/Icons';
import { getMediaUrl } from '@/lib/media';
import { Skeleton } from '@/components/Skeleton';
import { CardContainer, CardContent, CardTitle, CardTags, CardActions } from '@/components/CardContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { ActionButton, IconButton, StatusBadge } from '@/components/ActionBar';


export default function ProjetsDashboardPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [techFilter, setTechFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const params: Record<string, string> = { page: String(currentPage), all: 'true' };
  if (search) params.search = search;
  if (techFilter) params.technologie = techFilter;
  if (statutFilter) params.statut = statutFilter;

  const { data: projetsResponse, isLoading, isError, refetch } = useProjects(params, !!utilisateur);
  const deleteProjet = useDeleteProjet();

  const togglePublier = useMutation({
    mutationFn: ({ id, est_publie }: { id: number; est_publie: boolean }) =>
      api.put(`/projets/${id}`, { est_publie }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.projets(), exact: false }),
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
    try {
      await deleteProjet.mutateAsync(deleteTarget);
      setDeleteTarget(null);
    } catch {
      // error toast handled by mutation
    }
  }

  const allTechs = [...new Set(projets.flatMap((p: Projet) => p.technologies ?? []))].sort();

  return (
    <div className="max-w-4xl mx-auto">
      <SectionHeader
        title="Projets"
        actions={
          <Link href="/dashboard/projets/new">
            <ActionButton variant="primary">Nouveau projet</ActionButton>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          placeholder="Rechercher par titre..."
          className="flex-1 min-w-0 sm:min-w-[200px] border border-[#333] rounded px-3 py-2 bg-transparent text-off-white placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        <select value={techFilter} onChange={(e) => { setTechFilter(e.target.value); setCurrentPage(1); }}
          className="w-full min-w-0 bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-off-white focus-visible:outline-none">
          <option value="">Toutes technos</option>
          {allTechs.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statutFilter} onChange={(e) => { setStatutFilter(e.target.value); setCurrentPage(1); }}
          className="w-full min-w-0 bg-[#111] border border-[#222] rounded px-3 py-2 text-sm text-off-white focus-visible:outline-none">
          <option value="">Tous statuts</option>
          <option value="publie">Publié</option>
          <option value="brouillon">Brouillon</option>
        </select>
      </div>

      {isError ? (
        <div className="text-center py-16">
          <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur chargement projets</p>
          <ActionButton variant="primary" onClick={() => refetch()}>Réessayer</ActionButton>
        </div>
      ) : isLoading ? (
        <ResponsiveGrid columns={1} gap={3}>
          {Array.from({ length: 3 }).map((_, i) => (
            <CardContainer key={i} className="animate-pulse p-4">
              <CardContent className="p-0">
                <Skeleton className="h-16 w-full rounded" />
              </CardContent>
            </CardContainer>
          ))}
        </ResponsiveGrid>
      ) : (
        <>
          <ResponsiveGrid columns={1} gap={4}>
            {projets.map((p) => (
              <CardContainer key={p.id} hover className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-16 h-12 rounded overflow-hidden bg-[#222] shrink-0 relative">
                    {(() => {
                      const cover = p.image_couverture || p.medias?.find(m => m.type === 'image')?.chemin_fichier;
                      const coverUrl = cover ? getMediaUrl(cover) : null;
                      return coverUrl ? (
                        <Image src={coverUrl} alt="" fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icons.file className="w-5 h-5 text-muted" />
                        </div>
                      );
                    })()}
                  </div>
                  <CardContent className="p-0 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base truncate">{p.titre}</CardTitle>
                      <StatusBadge variant={p.est_publie ? 'success' : 'warning'} size="sm">
                        {p.est_publie ? 'Publié' : 'Brouillon'}
                      </StatusBadge>
                    </div>
                    {p.technologies && p.technologies.length > 0 && (
                      <CardTags tags={p.technologies} maxVisible={5} className="mt-1" />
                    )}
                    {p.medias && p.medias.length > 0 && (
                      <p className="text-[10px] text-muted font-mono mt-1">
                        {p.medias.length} média{p.medias.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </CardContent>
                  <CardActions className="mt-0 pt-0 border-0 flex-shrink-0">
                    <IconButton
                      onClick={() => handleTogglePublier(p)}
                      icon={p.est_publie ? <Icons.folder className="w-4 h-4" /> : <Icons.external className="w-4 h-4" />}
                      label={p.est_publie ? 'Archiver' : 'Publier'}
                      variant="ghost"
                      size="sm"
                      disabled={togglePublier.isPending}
                    />
                    <Link href={`/dashboard/projets/${p.id}/edit`}>
                      <IconButton
                        icon={<Icons.edit className="w-4 h-4" />}
                        label="Modifier"
                        variant="ghost"
                        size="sm"
                      />
                    </Link>
                    <IconButton
                      onClick={() => setDeleteTarget(p.id)}
                      icon={<Icons.trash className="w-4 h-4" />}
                      label="Supprimer"
                      variant="danger"
                      size="sm"
                    />
                  </CardActions>
                </div>
              </CardContainer>
            ))}
          </ResponsiveGrid>

          {projets.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-muted font-mono text-sm">Aucun projet trouvé.</p>
            </div>
          )}

          <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
        </>
      )}

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