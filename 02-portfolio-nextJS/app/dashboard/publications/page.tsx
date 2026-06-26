'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePublications, useDomaines } from '@/hooks/queries';
import { useDeletePublication } from '@/hooks/mutations';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import { getMediaUrl } from '@/lib/media';
import { Domaine } from '@/types/api';
import { Pagination } from '@/components/ActionBar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Icons } from '@/components/ui/Icons';
import { Skeleton } from '@/components/Skeleton';
import { CardContainer, CardContent, CardTitle, CardDescription, CardActions } from '@/components/CardContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { ResponsiveGrid } from '@/components/ResponsiveGrid';
import { ActionButton, IconButton, StatusBadge } from '@/components/ActionBar';

const TYPES = ['article', 'tutoriel', 'note'];

export default function PublicationsDashboardPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [domaineFilter, setDomaineFilter] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const params: Record<string, string> = { page: String(currentPage), all: 'true' };
  if (typeFilter) params.type = typeFilter;
  if (domaineFilter) params.domaine = domaineFilter;
  if (statutFilter) params.statut = statutFilter;

  const { data: publicationsResponse, isLoading, isError, refetch } = usePublications(params, !!utilisateur);
  const { data: domainesData } = useDomaines();
  const domaines = domainesData ?? [];

  const deletePublication = useDeletePublication();

  const togglePublier = useMutation({
    mutationFn: ({ id, est_publie }: { id: number; est_publie: boolean }) =>
      api.put(`/publications/${id}`, { est_publie }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk.publications(), exact: false }),
  });

  const publications = publicationsResponse?.data ?? [];
  const lastPage = publicationsResponse?.last_page ?? 1;
  const total = publicationsResponse?.total ?? 0;

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deletePublication.mutateAsync(deleteTarget);
      setDeleteTarget(null);
    } catch {
      // error toast handled by mutation
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <SectionHeader
        title="Publications"
        actions={
          <Link href="/dashboard/publications/new">
            <ActionButton variant="primary">Nouvelle publication</ActionButton>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2 mb-6">
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
            {publications.map((p) => (
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
                      <span className="text-xs text-muted bg-[#222] px-2 py-0.5 rounded">{p.type}</span>
                    </div>
                    <CardDescription className="text-sm">
                      {p.publie_le ? new Date(p.publie_le).toLocaleDateString('fr-FR') : 'Non publié'}
                      {(p.domaines?.length ?? 0) > 0 && (
                        <span> — {p.domaines.map((d: Domaine, i) => (
                          <span key={d.id}>{i > 0 && ', '}<Link href="/dashboard/domaines" className="text-acid hover:underline">{d.nom}</Link></span>
                        ))}</span>
                      )}
                    </CardDescription>
                    {p.medias && p.medias.length > 0 && (
                      <p className="text-[10px] text-muted font-mono mt-1">
                        {p.medias.length} média{p.medias.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </CardContent>
                  <CardActions className="mt-0 pt-0 border-0 flex-shrink-0 ml-4">
                  <IconButton
                    onClick={() => togglePublier.mutate({ id: p.id, est_publie: !p.est_publie })}
                    icon={p.est_publie ? <Icons.folder className="w-4 h-4" /> : <Icons.external className="w-4 h-4" />}
                    label={p.est_publie ? 'Archiver' : 'Publier'}
                    variant="ghost"
                    size="sm"
                    disabled={togglePublier.isPending}
                  />
                  <Link href={`/dashboard/publications/${p.id}/edit`}>
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

          {publications.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-muted font-mono text-sm">Aucune publication trouvée.</p>
            </div>
          )}

          <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
        </>
      )}

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