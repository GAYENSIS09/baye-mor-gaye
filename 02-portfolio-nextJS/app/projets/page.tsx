'use client';

import { useState, useMemo } from 'react';
import { useProjects } from '@/hooks/queries';
import Link from 'next/link';
import SkeletonCard from '@/components/SkeletonCard';
import { getMediaUrl } from '@/lib/media';
import { SectionHeader } from '@/components/SectionHeader';
import type { Projet } from '@/types/api';
import { Icons } from '@/components/ui/Icons';
import { CardContainer, CardImage, CardContent, CardTitle, CardDescription, CardMeta, CardTags } from '@/components/CardContainer';
import { ResponsiveGrid, ListGrid } from '@/components/ResponsiveGrid';
import { ActionButton, Pagination, LoadMoreButton } from '@/components/ActionBar';

function TechFilterBar({ allTechs, selected, onSelect }: { allTechs: string[]; selected: string; onSelect: (t: string) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap" role="tablist" aria-label="Filtres par technologie">
      <button onClick={() => onSelect('')} role="tab" aria-selected={!selected}
        className={`whitespace-nowrap font-mono text-xs uppercase tracking-widest transition-all duration-200 ${!selected ? 'bg-acid text-black px-3 py-1.5 rounded' : 'bg-[#222] text-muted hover:text-off-white px-3 py-1.5 rounded'}`}>
        Tous
      </button>
      {allTechs.map((tech) => (
        <button key={tech} onClick={() => onSelect(tech)} role="tab" aria-selected={selected === tech}
          className={`whitespace-nowrap font-mono text-xs uppercase tracking-widest transition-all duration-200 ${selected === tech ? 'bg-acid text-black px-3 py-1.5 rounded' : 'bg-[#222] text-muted hover:text-off-white px-3 py-1.5 rounded'}`}>
          {tech}
        </button>
      ))}
    </div>
  );
}

function ProjetCard({ projet }: { projet: Projet }) {
  const thumbnailSrc = getMediaUrl(projet.image_couverture)
    || (projet.medias?.length > 0
      ? getMediaUrl(projet.medias.find(m => m.est_principal)?.vignette || projet.medias[0].vignette || projet.medias[0].chemin_fichier)
      : null);

  return (
    <Link href={`/projets/${projet.slug}`}>
      <CardContainer hover>
        {thumbnailSrc && (
          <CardImage src={thumbnailSrc} alt={projet.titre} aspectRatio="video" />
        )}
        <CardContent>
          <CardTitle>{projet.titre}</CardTitle>
          <CardDescription lines={2}>{projet.courte_description || projet.description}</CardDescription>
          {projet.technologies && projet.technologies.length > 0 && (
            <CardTags tags={projet.technologies} maxVisible={5} />
          )}
          <CardMeta>
            {projet.nombre_vues !== undefined && (
              <span className="font-mono flex items-center gap-1">
                <Icons.search className="w-3.5 h-3.5 inline" aria-hidden /> {projet.nombre_vues}
              </span>
            )}
            {projet.likes && projet.likes.length > 0 && (
              <span className="font-mono flex items-center gap-1">
                <Icons.star className="w-3.5 h-3.5 inline" aria-hidden /> {projet.likes.length}
              </span>
            )}
            {projet.commentaires && projet.commentaires.length > 0 && (
              <span className="font-mono flex items-center gap-1">
                <Icons.chat className="w-3.5 h-3.5 inline" aria-hidden /> {projet.commentaires.length}
              </span>
            )}
          </CardMeta>
        </CardContent>
      </CardContainer>
    </Link>
  );
}

export default function ProjetsPage() {
  const [techFilter, setTechFilter] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading, isFetching, isError, refetch } = useProjects({ publie: 'true', page: String(currentPage) });
  const projets = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  const allTechs = useMemo(() => {
    const techs = new Set<string>();
    projets.forEach((p) => p.technologies?.forEach((t) => techs.add(t)));
    return Array.from(techs).sort();
  }, [projets]);

  const filtered = projets.filter((p) => {
    if (techFilter && !p.technologies?.includes(techFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.titre.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q) && !p.technologies?.some((t) => t.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const hasMore = currentPage < lastPage;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <SectionHeader
        breadcrumb={[{ label: 'Accueil', href: '/' }, { label: 'Projets' }]}
        title="Projets"
        subtitle="Découvrez mes réalisations et projets."
        total={total}
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
        searchPlaceholder="Rechercher un projet..."
      >
        {allTechs.length > 0 && (
          <TechFilterBar allTechs={allTechs} selected={techFilter} onSelect={(t) => { setTechFilter(t); setCurrentPage(1); }} />
        )}
      </SectionHeader>

      <main className="max-w-6xl mx-auto p-4 py-8">
        {isError ? (
          <div className="text-center py-16">
            <p className="text-muted font-mono text-sm mb-4" role="alert">Erreur chargement projets</p>
            <ActionButton variant="primary" onClick={() => refetch()}>Réessayer</ActionButton>
          </div>
        ) : isLoading ? (
          <ResponsiveGrid columns={3} gap={6}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </ResponsiveGrid>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-muted font-mono text-sm">
              {search ? `Aucun projet ne correspond à "${search}".` : techFilter ? `Aucun projet avec la technologie "${techFilter}".` : 'Aucun projet pour le moment.'}
            </p>
          </div>
        ) : (
          <>
            <ResponsiveGrid columns={3} gap={6}>
              {filtered.map((p) => <ProjetCard key={p.id} projet={p} />)}
            </ResponsiveGrid>
            <LoadMoreButton
              onClick={() => setCurrentPage((p) => p + 1)}
              isLoading={isFetching}
              hasMore={!techFilter && !search && hasMore}
            />
          </>
        )}
      </main>
    </div>
  );
}