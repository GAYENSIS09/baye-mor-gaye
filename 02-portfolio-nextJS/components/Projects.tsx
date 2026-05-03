"use client";
import Image from "next/image";
import { useProjects } from "@/hooks/queries";
import Link from "next/link";
import { CompactMediaRow } from "@/components/MediaGallery";

export default function ProjetsFeaturedSection() {
  const { data, isLoading: loading, isError: error } = useProjects({ publie: "1", en_vedette: "1" });
  const featured = (data?.data ?? []).slice(0, 3);

  return (
    <section id="projects" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between gap-6 mb-16">
          <div className="flex items-baseline gap-6">
            <span className="font-mono text-acid text-xs uppercase tracking-widest">04</span>
            <h2 className="font-display text-5xl md:text-7xl text-white uppercase tracking-tight">Projets</h2>
          </div>
          <Link href="/projets" className="text-sm text-acid hover:underline font-mono uppercase tracking-widest">
            Voir tout →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <span className="font-mono text-sm text-muted animate-pulse">Chargement des projets...</span>
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
              <Link key={p.id} href={`/projets/${p.slug}`}
                className="group relative border border-[#222] rounded-lg overflow-hidden hover:border-acid/40 transition-colors duration-300 bg-off-black">
                {p.image_couverture && (
                  <div className="aspect-video overflow-hidden relative">
                    <Image src={p.image_couverture} alt={p.titre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-off-white text-lg font-body font-medium mb-2 group-hover:text-acid transition-colors">{p.titre}</h3>
                  <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-2">{p.courte_description || p.description}</p>
                  {p.technologies && p.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {p.technologies.slice(0, 4).map((t: string) => (
                        <span key={t} className="tag">{t}</span>
                      ))}
                      {p.technologies.length > 4 && <span className="tag">+{p.technologies.length - 4}</span>}
                    </div>
                  )}
                  {p.medias && p.medias.length > 0 && (
                    <CompactMediaRow
                      items={p.medias.map((m) => ({
                        id: m.id,
                        url: m.url_externe || m.chemin_fichier,
                        type: m.type,
                        titre: m.titre,
                        vignette: m.vignette || undefined,
                      }))}
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
