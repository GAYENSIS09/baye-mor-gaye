"use client";
import { usePublications } from "@/hooks/queries";
import DomaineBadge from "@/components/DomaineBadge";
import Link from "next/link";
import type { Publication, Commentaire, Domaine } from "@/types/api";
import { Icons } from '@/components/ui/Icons';

function PublicationCardLarge({ pub }: { pub: Publication }) {
  return (
    <Link href={`/publications/${pub.slug}`}
      className="group relative bg-[#111] border border-[#222] rounded-lg overflow-hidden hover:border-acid/40 transition-colors md:col-span-2">
      {pub.image_couverture && (
        <div className="aspect-video md:aspect-[2.4/1] overflow-hidden relative">
          <img src={pub.image_couverture} alt={pub.titre} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-acid/10 text-acid px-2 py-0.5 rounded-full font-mono">{pub.type}</span>
          <span className="text-xs text-muted">{pub.publie_le ? new Date(pub.publie_le).toLocaleDateString('fr-FR') : ''}</span>
        </div>
        <h3 className="text-xl font-bold text-off-white mb-2 group-hover:text-acid transition-colors">{pub.titre}</h3>
        {pub.extrait && <p className="text-muted text-sm line-clamp-2">{pub.extrait}</p>}
        {pub.domaines && pub.domaines.length > 0 && (
          <div className="flex gap-2 mt-3">
            {pub.domaines.map((d: Domaine) => <DomaineBadge key={d.id} nom={d.nom} couleur={d.couleur} />)}
          </div>
        )}
        <div className="flex items-center gap-4 mt-3 text-xs text-muted">
          {pub.nombre_vues != null && <span><Icons.search className="w-3.5 h-3.5 inline" aria-hidden /> {pub.nombre_vues}</span>}
          {pub.likes?.length != null && <span><Icons.star className="w-3.5 h-3.5 inline" aria-hidden /> {pub.likes.length}</span>}
          {pub.commentaires?.length != null && <span><Icons.chat className="w-3.5 h-3.5 inline" aria-hidden />           {pub.commentaires?.filter((c: Commentaire) => c.est_approuve).length}</span>}
        </div>
      </div>
    </Link>
  );
}

function PublicationCardSmall({ pub }: { pub: Publication }) {
  return (
    <Link href={`/publications/${pub.slug}`}
      className="group bg-[#111] border border-[#222] rounded-lg p-5 hover:border-acid/40 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs bg-acid/10 text-acid px-2 py-0.5 rounded-full font-mono">{pub.type}</span>
        <span className="text-xs text-muted">{pub.publie_le ? new Date(pub.publie_le).toLocaleDateString('fr-FR') : ''}</span>
      </div>
      <h3 className="text-base font-semibold text-off-white mb-1 group-hover:text-acid transition-colors">{pub.titre}</h3>
      {pub.extrait && <p className="text-muted text-xs line-clamp-2">{pub.extrait}</p>}
      <div className="flex items-center gap-3 mt-2 text-xs text-muted">
        {pub.nombre_vues != null && <span><Icons.search className="w-3.5 h-3.5 inline" aria-hidden /> {pub.nombre_vues}</span>}
        <span><Icons.star className="w-3.5 h-3.5 inline" aria-hidden /> {pub.likes?.length ?? 0}</span>
      </div>
    </Link>
  );
}

export default function PublicationsRecentesSection() {
  const { data, isLoading } = usePublications({ publie: 'true', limit: '3' });
  const publications = data?.data ?? [];

  return (
    <section id="publications" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between gap-6 mb-16">
          <div className="flex items-baseline gap-6">
            <span className="font-mono text-acid text-xs uppercase tracking-widest">05</span>
            <h2 className="font-display text-5xl md:text-7xl text-white uppercase tracking-tight">Publications</h2>
          </div>
          <Link href="/publications" className="text-sm text-acid hover:underline font-mono uppercase tracking-widest">
            Voir tout →
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <span className="font-mono text-sm text-muted animate-pulse">Chargement...</span>
          </div>
        ) : publications.length === 0 ? (
          <div className="text-center py-16">
            <span className="font-mono text-sm text-muted">Aucune publication pour le moment.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PublicationCardLarge pub={publications[0]} />
            {publications.slice(1, 3).map((pub) => (
              <PublicationCardSmall key={pub.id} pub={pub} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
