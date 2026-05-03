'use client';
import { useState } from 'react';
import { useRessources } from '@/hooks/queries';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import { Skeleton } from '@/components/Skeleton';
import { Icons } from '@/components/ui/Icons';
import type { Ressource } from '@/types/api';

const FILE_ICONS: Record<string, React.ReactNode> = {
  pdf: <Icons.file className="w-5 h-5" aria-hidden />,
  doc: <Icons.file className="w-5 h-5" aria-hidden />,
  docx: <Icons.file className="w-5 h-5" aria-hidden />,
  xls: <Icons.file className="w-5 h-5" aria-hidden />,
  xlsx: <Icons.file className="w-5 h-5" aria-hidden />,
  zip: <Icons.folder className="w-5 h-5" aria-hidden />,
  rar: <Icons.folder className="w-5 h-5" aria-hidden />,
  png: <Icons.file className="w-5 h-5" aria-hidden />,
  jpg: <Icons.file className="w-5 h-5" aria-hidden />,
  jpeg: <Icons.file className="w-5 h-5" aria-hidden />,
  gif: <Icons.file className="w-5 h-5" aria-hidden />,
  webp: <Icons.file className="w-5 h-5" aria-hidden />,
  csv: <Icons.file className="w-5 h-5" aria-hidden />,
  json: <Icons.file className="w-5 h-5" aria-hidden />,
  ics: <Icons.calendar className="w-5 h-5" aria-hidden />,
};

function getFileTypeIcon(type_fichier: string | null, type: string): React.ReactNode {
  if (type === 'lien') return <Icons.external className="w-5 h-5" aria-hidden />;
  if (!type_fichier) return <Icons.file className="w-5 h-5" aria-hidden />;
  const ext = type_fichier.split('/').pop()?.split('.').pop()?.toLowerCase() || type_fichier.toLowerCase();
  for (const [key, icon] of Object.entries(FILE_ICONS)) {
    if (ext.includes(key) || type_fichier.includes(key)) return icon;
  }
  return <Icons.file className="w-5 h-5" aria-hidden />;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes || bytes === 0) return '';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function ResourceCard({ resource }: { resource: Ressource }) {
  const icon = getFileTypeIcon(resource.type_fichier, resource.type);
  const href = resource.type === 'lien' ? resource.url_externe : resource.fichier;
  const isExternal = resource.type === 'lien' ? true : false;

  if (!href) return null;

  return (
    <Link
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      className="bg-[#111] p-6 rounded-lg border border-[#222] hover:border-acid/30 transition-all group flex flex-col"
    >
      <div className="flex items-start gap-4 mb-3">
        <span className="text-2xl shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-off-white group-hover:text-acid transition-colors truncate">{resource.titre}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {resource.type === 'fichier' && (
              <span className="text-xs bg-[#222] text-muted px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                {resource.type_fichier?.split('/').pop()?.toUpperCase() || 'FICHIER'}
              </span>
            )}
            {resource.type === 'lien' && (
              <span className="text-xs bg-[#222] text-muted px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                LIEN
              </span>
            )}
            {resource.domaine && (
              <span className="text-xs bg-acid/10 text-acid px-2 py-0.5 rounded font-mono">
                {resource.domaine.nom}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-auto text-xs text-muted">
        {resource.taille && resource.type === 'fichier' && (
          <span className="font-mono flex items-center gap-1">
            <Icons.db className="w-3 h-3" aria-hidden />
            {formatFileSize(resource.taille)}
          </span>
        )}
        {resource.nombre_telechargements > 0 && (
          <span className="font-mono flex items-center gap-1">
            <Icons.download className="w-3 h-3" aria-hidden />
            {resource.nombre_telechargements} téléchargement{resource.nombre_telechargements > 1 ? 's' : ''}
          </span>
        )}
        <span className="font-mono ml-auto">
          {new Date(resource.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </Link>
  );
}

export default function RessourcesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: ressourcesRes, isLoading, isError, refetch } = useRessources({ page: String(currentPage) });
  const ressources = ressourcesRes?.data ?? [];
  const lastPage = ressourcesRes?.last_page ?? 1;
  const total = ressourcesRes?.total ?? 0;

  return (
    <div className="min-h-screen bg-off-black">
      <div className="max-w-6xl mx-auto px-6 py-32">
        <div className="flex items-baseline gap-6 mb-20">
          <span className="font-mono text-acid text-xs uppercase tracking-widest">Ressources</span>
          <h1 className="font-display text-5xl md:text-7xl text-white uppercase tracking-tight">
            Ressources
          </h1>
        </div>

        <div className="border-t border-[#222] pt-16">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#111] p-6 rounded border border-[#222] space-y-3">
                  <div className="flex items-start gap-4 mb-3">
                    <Skeleton className="w-8 h-8" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/3" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-16">
              <Icons.warning className="w-12 h-12 mx-auto text-muted/30 mb-4" role="img" aria-label="Erreur" />
              <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur lors du chargement des ressources</p>
              <button
                onClick={() => refetch()}
                className="bg-acid text-black px-4 py-2 font-mono text-xs uppercase tracking-widest hover:bg-acid/90 transition-colors rounded"
              >
                Réessayer
              </button>
            </div>
          ) : ressources.length === 0 ? (
            <div className="text-center py-16">
              <Icons.file className="w-12 h-12 mx-auto text-muted/30 mb-4" aria-hidden />
              <p className="text-muted font-mono text-sm">Aucune ressource disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ressources.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          )}
          <Pagination currentPage={currentPage} lastPage={lastPage} total={total} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  );
}
