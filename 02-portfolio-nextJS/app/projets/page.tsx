'use client';

import { useState, useMemo } from 'react';
import { useProjects } from '@/hooks/queries';
import Image from 'next/image';
import Link from 'next/link';
import SkeletonCard from '@/components/SkeletonCard';
import { getMediaUrl } from '@/lib/media';
import type { Projet } from '@/types/api';
import { Icons } from '@/components/ui/Icons';

function TechFilterBar({ allTechs, selected, onSelect }: { allTechs: string[]; selected: string; onSelect: (t: string) => void }) {
  return (
    <nav className="flex gap-2 flex-wrap">
      <button onClick={() => onSelect('')}
        className={`px-3 py-1.5 rounded font-mono text-xs uppercase tracking-widest transition-colors ${!selected ? 'bg-acid text-black' : 'bg-[#222] text-muted hover:text-off-white'}`}>
        Tous
      </button>
      {allTechs.map((tech) => (
        <button key={tech} onClick={() => onSelect(tech)}
          className={`px-3 py-1.5 rounded font-mono text-xs uppercase tracking-widest transition-colors ${selected === tech ? 'bg-acid text-black' : 'bg-[#222] text-muted hover:text-off-white'}`}>
          {tech}
        </button>
      ))}
    </nav>
  );
}

function ProjetCard({ projet }: { projet: Projet }) {
  const thumbnailSrc = projet.image_couverture
    || (projet.medias?.length > 0
      ? getMediaUrl(projet.medias.find(m => m.est_principal)?.vignette || projet.medias[0].vignette || projet.medias[0].chemin_fichier)
      : null);

  return (
    <Link href={`/projets/${projet.slug}`}
      className="group bg-[#111] border border-[#222] rounded-lg overflow-hidden hover:border-acid/40 transition-all duration-300">
      {thumbnailSrc && (
        <div className="aspect-video overflow-hidden relative">
          <Image src={thumbnailSrc} alt={projet.titre} width={640} height={360} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="p-5">
        <h3 className="text-off-white text-lg font-semibold mb-1 group-hover:text-acid transition-colors">{projet.titre}</h3>
        <p className="text-muted text-sm line-clamp-2 mb-3">{projet.courte_description || projet.description}</p>
        {projet.technologies && projet.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {projet.technologies.slice(0, 5).map((t: string) => (
              <span key={t} className="text-xs bg-acid/10 text-acid px-2 py-0.5 rounded-full font-mono">{t}</span>
            ))}
            {projet.technologies.length > 5 && <span className="text-xs text-muted">+{projet.technologies.length - 5}</span>}
          </div>
        )}
        <div className="flex items-center gap-3 text-xs text-muted mb-2">
          {projet.nombre_vues !== undefined && (
            <span className="font-mono flex items-center gap-1"><Icons.search className="w-3.5 h-3.5 inline" aria-hidden /> {projet.nombre_vues}</span>
          )}
          {projet.likes && projet.likes.length > 0 && (
            <span className="font-mono flex items-center gap-1"><Icons.star className="w-3.5 h-3.5 inline" aria-hidden /> {projet.likes.length}</span>
          )}
          {projet.commentaires && projet.commentaires.length > 0 && (
            <span className="font-mono flex items-center gap-1"><Icons.chat className="w-3.5 h-3.5 inline" aria-hidden /> {projet.commentaires.length}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs">
          {projet.url_demo && (
            <span className="text-acid font-mono" onClick={(e) => { e.preventDefault(); window.open(projet.url_demo!, '_blank'); }}>
              Demo ↗
            </span>
          )}
          {projet.url_code && (
            <span className="text-muted hover:text-off-white font-mono" onClick={(e) => { e.preventDefault(); window.open(projet.url_code!, '_blank'); }}>
              Code ↗
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function ProjetsPage() {
  const [techFilter, setTechFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isFetching } = useProjects({ publie: 'true', page: String(currentPage) });
  const projets = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  const allTechs = useMemo(() => {
    const techs = new Set<string>();
    projets.forEach((p) => p.technologies?.forEach((t) => techs.add(t)));
    return Array.from(techs).sort();
  }, [projets]);

  const filtered = techFilter
    ? projets.filter((p) => p.technologies?.includes(techFilter))
    : projets;

  const hasMore = currentPage < lastPage;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <header className="bg-[#111] border-b border-[#222] sticky top-0 z-40">
        <div className="max-w-6xl mx-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-off-white">Projets</h1>
            <span className="text-sm text-muted font-mono">{total} projet{total !== 1 ? 's' : ''}</span>
          </div>
          {allTechs.length > 0 && <TechFilterBar allTechs={allTechs} selected={techFilter} onSelect={(t) => { setTechFilter(t); setCurrentPage(1); }} />}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-muted font-mono text-sm">
              {techFilter ? `Aucun projet avec la technologie "${techFilter}".` : 'Aucun projet pour le moment.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => <ProjetCard key={p.id} projet={p} />)}
            </div>

            {!techFilter && hasMore && (
              <div className="text-center mt-10">
                <button onClick={() => setCurrentPage((p) => p + 1)} disabled={isFetching}
                  className="bg-[#222] text-off-white px-6 py-3 rounded font-mono text-xs uppercase tracking-widest hover:bg-[#333] transition-colors disabled:opacity-50">
                  {isFetching ? 'Chargement...' : 'Charger plus ↓'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
