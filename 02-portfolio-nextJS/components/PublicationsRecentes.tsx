"use client";
import { usePublications } from "@/hooks/queries";
import DomaineBadge from "@/components/DomaineBadge";
import Link from "next/link";
import type { Publication, Commentaire, Domaine } from "@/types/api";
import { Icons } from '@/components/ui/Icons';
import MediaViewer from '@/components/MediaViewer';
import { CardContainer, CardImage, CardContent, CardTitle, CardDescription, CardMeta } from "@/components/CardContainer";
import { SectionHeader } from "@/components/SectionHeader";

function PublicationCardLarge({ pub }: { pub: Publication }) {
  return (
    <CardContainer href={`/publications/${pub.slug}`} className="md:col-span-2" hover>
      {pub.image_couverture && (
        <CardImage
          src={pub.image_couverture}
          alt={pub.titre}
          aspectRatio="video"
        />
      )}
      <CardContent>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-acid/10 text-acid px-2 py-0.5 rounded-full font-mono">{pub.type}</span>
          <span className="text-xs text-muted">{pub.publie_le ? new Date(pub.publie_le).toLocaleDateString('fr-FR') : ''}</span>
        </div>
        <CardTitle className="text-xl">{pub.titre}</CardTitle>
        {pub.extrait && <CardDescription lines={2}>{pub.extrait}</CardDescription>}
        {pub.domaines && pub.domaines.length > 0 && (
          <div className="flex gap-2 mt-3">
            {pub.domaines.map((d: Domaine) => <DomaineBadge key={d.id} nom={d.nom} couleur={d.couleur} />)}
          </div>
        )}
        <CardMeta>
          {pub.nombre_vues != null && (
            <span><Icons.search className="w-3.5 h-3.5 inline" aria-hidden /> {pub.nombre_vues}</span>
          )}
          {pub.likes?.length != null && (
            <span><Icons.star className="w-3.5 h-3.5 inline" aria-hidden /> {pub.likes.length}</span>
          )}
          {pub.commentaires?.length != null && (
            <span><Icons.chat className="w-3.5 h-3.5 inline" aria-hidden /> {pub.commentaires?.filter((c: Commentaire) => c.est_approuve).length}</span>
          )}
        </CardMeta>
      </CardContent>
    </CardContainer>
  );
}

function PublicationCardSmall({ pub }: { pub: Publication }) {
  return (
    <CardContainer href={`/publications/${pub.slug}`} hover>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-acid/10 text-acid px-2 py-0.5 rounded-full font-mono">{pub.type}</span>
          <span className="text-xs text-muted">{pub.publie_le ? new Date(pub.publie_le).toLocaleDateString('fr-FR') : ''}</span>
        </div>
        <CardTitle className="text-base">{pub.titre}</CardTitle>
        {pub.extrait && <CardDescription lines={2} className="text-xs">{pub.extrait}</CardDescription>}
        <CardMeta>
          {pub.nombre_vues != null && (
            <span><Icons.search className="w-3.5 h-3.5 inline" aria-hidden /> {pub.nombre_vues}</span>
          )}
          <span><Icons.star className="w-3.5 h-3.5 inline" aria-hidden /> {pub.likes?.length ?? 0}</span>
        </CardMeta>
      </CardContent>
    </CardContainer>
  );
}

export default function PublicationsRecentesSection() {
  const { data, isLoading, isError, refetch } = usePublications({ publie: 'true', limit: '3' });
  const publications = data?.data ?? [];

  return (
    <section id="publications" className="py-16 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          number="05"
          title="Publications"
          actions={
            <Link href="/publications" className="text-sm text-acid hover:underline font-mono uppercase tracking-widest">
              Voir tout →
            </Link>
          }
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardContainer className="md:col-span-2 animate-pulse">
              <div className="aspect-video md:aspect-[2.4/1] bg-[#222] rounded-xl" />
              <CardContent>
                <CardTitle>Chargement...</CardTitle>
                <CardDescription>Contenu en cours de chargement</CardDescription>
              </CardContent>
            </CardContainer>
            {Array.from({ length: 2 }).map((_, i) => (
              <CardContainer key={i} className="animate-pulse">
                <CardContent>
                  <CardTitle>Chargement...</CardTitle>
                  <CardDescription>Contenu en cours de chargement</CardDescription>
                </CardContent>
              </CardContainer>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <span className="font-mono text-sm text-muted">Impossible de charger les publications.</span>
            <button onClick={() => refetch()} className="block mx-auto mt-4 text-sm text-acid hover:underline font-mono">
              Réessayer
            </button>
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