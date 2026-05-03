'use client';

import { useState } from 'react';
import { usePublications, useDomaines } from '@/hooks/queries';
import DomaineBadge from '@/components/DomaineBadge';
import Link from 'next/link';
import { Skeleton } from '@/components/Skeleton';
import type { Publication } from '@/types/api';
import { Icons } from '@/components/ui/Icons';

const TYPES = [
  { value: '', label: 'Tous' },
  { value: 'article', label: 'Articles' },
  { value: 'tutoriel', label: 'Tutoriels' },
  { value: 'note', label: 'Notes' },
];

function PublicationRow({ pub }: { pub: Publication }) {
  const approvedCount = pub.commentaires?.filter((c) => c.est_approuve).length ?? 0;

  return (
    <Link href={`/publications/${pub.slug}`}
      className="group bg-[#111] p-5 rounded-lg border border-[#222] hover:border-acid/30 transition-all block">
      <div className="flex items-start gap-4">
        {pub.image_couverture && (
          <div className="hidden sm:block w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <img src={pub.image_couverture} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-acid/10 text-acid px-2 py-0.5 rounded-full font-mono">{pub.type}</span>
            {pub.domaines?.map((d) => <DomaineBadge key={d.id} nom={d.nom} couleur={d.couleur} />)}
          </div>
          <h2 className="text-lg font-semibold text-off-white group-hover:text-acid transition-colors">{pub.titre}</h2>
          {pub.extrait && <p className="text-muted text-sm mt-1 line-clamp-2">{pub.extrait}</p>}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted">
            <span>{pub.publie_le ? new Date(pub.publie_le).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
            {pub.nombre_vues != null && <span><Icons.search className="w-3.5 h-3.5 inline" aria-hidden /> {pub.nombre_vues}</span>}
            <span><Icons.star className="w-3.5 h-3.5 inline" aria-hidden /> {pub.likes?.length ?? 0}</span>
            <span><Icons.chat className="w-3.5 h-3.5 inline" aria-hidden /> {approvedCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function PublicationsPage() {
  const [typeFilter, setTypeFilter] = useState('');
  const [domaineFilter, setDomaineFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const params: Record<string, string> = { publie: 'true', page: String(currentPage) };
  if (typeFilter) params.type = typeFilter;
  if (domaineFilter) params.domaine = domaineFilter;
  const { data, isLoading } = usePublications(params);
  const { data: domainesData } = useDomaines();
  const domaines = domainesData ?? [];
  const publications = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="bg-[#111] border-b border-[#222] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto p-4 space-y-3">
          <h1 className="text-2xl font-bold text-off-white">Publications</h1>
          <nav className="flex gap-2 flex-wrap">
            {TYPES.map((t) => (
              <button key={t.value} onClick={() => { setTypeFilter(t.value); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded font-mono text-xs uppercase tracking-widest transition-colors ${typeFilter === t.value ? 'bg-acid text-black' : 'bg-[#222] text-muted hover:text-off-white'}`}>
                {t.label}
              </button>
            ))}
          </nav>
          <nav className="flex gap-2 flex-wrap">
            <button onClick={() => { setDomaineFilter(''); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded font-mono text-xs uppercase tracking-widest transition-colors ${!domaineFilter ? 'bg-acid text-black' : 'bg-[#222] text-muted hover:text-off-white'}`}>
              Tous
            </button>
            {domaines.map((d) => (
              <button key={d.id} onClick={() => { setDomaineFilter(d.slug); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded font-mono text-xs uppercase tracking-widest transition-colors ${domaineFilter === d.slug ? 'bg-acid text-black' : 'bg-[#222] text-muted hover:text-off-white'}`}>
                {d.nom}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8">
        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-[#111] p-4 rounded border border-[#222]">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : publications.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-muted font-mono text-sm">Aucune publication pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {publications.map((p) => <PublicationRow key={p.id} pub={p} />)}
          </div>
        )}

        {lastPage > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded font-mono text-xs transition-colors ${currentPage === page ? 'bg-acid text-black' : 'bg-[#222] text-muted hover:text-off-white'}`}>
                {page}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
