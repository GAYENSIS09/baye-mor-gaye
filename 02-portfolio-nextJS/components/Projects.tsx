"use client";
import { useProjects } from "@/hooks/queries";
import Link from "next/link";
import { getMediaUrl } from "@/lib/media";
import { CardContainer, CardImage, CardContent, CardTitle, CardDescription, CardMeta, CardTags } from "@/components/CardContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { Icons } from "@/components/ui/Icons";

export default function ProjetsFeaturedSection() {
  const { data, isLoading: loading, isError: error } = useProjects({ publie: "1", en_vedette: "1" });
  const featured = (data?.data ?? []).slice(0, 3);

  return (
    <section id="projects" className="py-16 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          number="04"
          title="Projets"
          actions={
            <Link href="/projets" className="text-sm text-acid hover:underline font-mono uppercase tracking-widest">
              Voir tout →
            </Link>
          }
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardContainer key={i} className="animate-pulse">
                <div className="aspect-video bg-[#222] rounded-xl" />
                <CardContent>
                  <CardTitle>Chargement...</CardTitle>
                  <CardDescription>Description du projet en cours de chargement</CardDescription>
                </CardContent>
              </CardContainer>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <span className="font-mono text-sm text-muted">Impossible de charger les projets.</span>
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16">
            <span className="font-mono text-sm text-muted">Aucun projet à afficher.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <CardContainer key={p.id} href={`/projets/${p.slug}`} hover>
                {p.image_couverture && (
                  <CardImage
                    src={getMediaUrl(p.image_couverture) ?? p.image_couverture}
                    alt={p.titre}
                    aspectRatio="video"
                  />
                )}
                <CardContent>
                  <CardTitle>{p.titre}</CardTitle>
                  <CardDescription lines={2}>{p.courte_description || p.description}</CardDescription>
                  {p.technologies && p.technologies.length > 0 && (
                    <CardTags tags={p.technologies} maxVisible={4} />
                  )}
                  <CardMeta>
                    {p.nombre_vues !== undefined && (
                      <span className="font-mono flex items-center gap-1">
                        <Icons.search className="w-3.5 h-3.5 inline" aria-hidden />
                        {p.nombre_vues}
                      </span>
                    )}
                    {p.likes && p.likes.length > 0 && (
                      <span className="font-mono flex items-center gap-1">
                        <Icons.star className="w-3.5 h-3.5 inline" aria-hidden />
                        {p.likes.length}
                      </span>
                    )}
                    {p.commentaires && p.commentaires.length > 0 && (
                      <span className="font-mono flex items-center gap-1">
                        <Icons.chat className="w-3.5 h-3.5 inline" aria-hidden />
                        {p.commentaires.length}
                      </span>
                    )}
                  </CardMeta>
                </CardContent>
              </CardContainer>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}