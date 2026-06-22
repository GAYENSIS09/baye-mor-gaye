'use client';

import { useEffect } from 'react';
import { useProject } from '@/hooks/queries';
import { useParams, notFound } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import MediaViewer from '@/components/MediaViewer';
import { LikeButton } from '@/components/LikeButton';
import ReadingProgress from '@/components/ReadingProgress';
import CommentSection from '@/components/CommentSection';
import MediaGallery from '@/components/MediaGallery';
import { SectionHeader } from '@/components/SectionHeader';
import { api } from '@/lib/api';
import { Like } from '@/types/api';
import { Icons } from '@/components/ui/Icons';

export default function ProjetClient() {
  const params = useParams();
  const { utilisateur } = useAuth();
  const slug = params.slug as string;
  const { data: projet, isLoading, isError } = useProject(slug);

  useEffect(() => {
    if (projet?.id) {
      api.post('/vues', { page: 'projet', page_id: projet.id }).catch(() => {});
    }
  }, [projet?.id]);

  if (isLoading) return <div className="p-8 text-center text-muted">Chargement...</div>;
  if (isError || !projet) return notFound();

  const liked = utilisateur ? projet.likes?.some((l: Like) => l.auteur_id === utilisateur.id) : false;
  const likesCount = projet.likes?.length ?? 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <ReadingProgress />
      <SectionHeader
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Projets', href: '/projets' },
          { label: projet.titre },
        ]}
        backHref="/projets"
        backLabel="Retour aux projets"
        title={projet.titre}
        actions={
          <span className="text-xs text-muted font-mono">{Math.ceil((projet.description?.length ?? 0) / 1000)} min de lecture</span>
        }
      />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          <div className="md:grid md:grid-cols-5 md:gap-8">
            <div className="md:col-span-3">
              {projet.image_couverture && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
                  <MediaViewer src={projet.image_couverture} alt={projet.titre} fill className="object-cover" />
                </div>
              )}

              {projet.medias && projet.medias.length > 0 && (
                <div className="mb-4">
                  <MediaGallery
                    items={projet.medias.filter((m) => m.url_externe || m.chemin_fichier).map((m) => ({
                      id: m.id,
                      url: m.url_externe || m.chemin_fichier!,
                      type: m.type,
                      titre: m.titre,
                      vignette: m.vignette || undefined,
                    }))}
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2 md:sticky md:top-24 md:self-start">
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-3 text-off-white leading-tight">{projet.titre}</h1>

              <div className="flex items-center gap-4 text-sm text-muted mb-3">
                <span>{projet.publie_le ? new Date(projet.publie_le).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date inconnue'}</span>
                {projet.nombre_vues != null && <span><Icons.search className="w-3.5 h-3.5 inline" aria-hidden /> {projet.nombre_vues}</span>}
              </div>

              {projet.technologies && projet.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {projet.technologies.map((t: string) => (
                    <span key={t} className="bg-acid/10 text-acid text-xs px-2 py-0.5 rounded-full font-mono">{t}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                {projet.url_demo && (
                  <a href={projet.url_demo} target="_blank" rel="noopener noreferrer"
                    className="bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 font-mono text-xs uppercase tracking-widest transition-colors">Demo</a>
                )}
                {projet.url_code && (
                  <a href={projet.url_code} target="_blank" rel="noopener noreferrer"
                    className="bg-[#222] text-off-white px-4 py-2 rounded hover:bg-[#333] font-mono text-xs uppercase tracking-widest transition-colors">Code source</a>
                )}
              </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-off-white mb-8 whitespace-pre-wrap mt-6">{projet.description}</div>

          <div className="flex items-center gap-4 border-t border-[#222] pt-6 mb-12">
            <LikeButton projetId={projet.id} initialLiked={liked} initialCount={likesCount} />
          </div>
        </article>

        <CommentSection entityType="projet" entityId={projet.id} comments={projet.commentaires ?? []} />
      </main>
    </div>
  );
}
