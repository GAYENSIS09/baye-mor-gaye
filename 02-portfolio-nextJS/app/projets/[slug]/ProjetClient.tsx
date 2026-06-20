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
import { api } from '@/lib/api';
import { Like } from '@/types/api';
import Link from 'next/link';
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
      <div className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-[#222]">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link href="/projets" className="text-sm text-muted hover:text-off-white transition-colors font-mono">← Projets</Link>
          <span className="text-sm text-muted truncate max-w-[50%]">{projet.titre}</span>
          <span className="text-xs text-muted font-mono">{Math.ceil((projet.description?.length ?? 0) / 1000)} min de lecture</span>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="max-w-3xl mx-auto">
          {projet.image_couverture && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8">
              <MediaViewer src={projet.image_couverture} alt={projet.titre} fill className="object-cover" />
            </div>
          )}

          {projet.medias && projet.medias.length > 0 && (
            <div className="mb-8">
              <MediaGallery
                items={projet.medias.map((m) => ({
                  id: m.id,
                  url: m.url_externe || m.chemin_fichier,
                  type: m.type,
                  titre: m.titre,
                  vignette: m.vignette || undefined,
                }))}
              />
            </div>
          )}

          <h1 className="text-4xl font-display font-bold mb-4 text-off-white leading-tight">{projet.titre}</h1>

          <div className="flex items-center gap-4 text-sm text-muted mb-4">
            <span>{projet.publie_le ? new Date(projet.publie_le).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date inconnue'}</span>
            {projet.nombre_vues != null && <span><Icons.search className="w-3.5 h-3.5 inline" aria-hidden /> {projet.nombre_vues}</span>}
          </div>

          {projet.technologies && projet.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {projet.technologies.map((t: string) => (
                <span key={t} className="bg-acid/10 text-acid text-xs px-2.5 py-1 rounded-full font-mono">{t}</span>
              ))}
            </div>
          )}

          <div className="prose prose-invert max-w-none text-off-white mb-8 whitespace-pre-wrap">{projet.description}</div>

          <div className="flex items-center gap-3 mb-8">
            {projet.url_demo && (
              <a href={projet.url_demo} target="_blank" rel="noopener noreferrer"
                className="bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 font-mono text-xs uppercase tracking-widest transition-colors">Demo</a>
            )}
            {projet.url_code && (
              <a href={projet.url_code} target="_blank" rel="noopener noreferrer"
                className="bg-[#222] text-off-white px-4 py-2 rounded hover:bg-[#333] font-mono text-xs uppercase tracking-widest transition-colors">Code source</a>
            )}
          </div>

          <div className="flex items-center gap-4 border-t border-[#222] pt-6 mb-12">
            <LikeButton projetId={projet.id} initialLiked={liked} initialCount={likesCount} />
          </div>
        </article>

        <CommentSection entityType="projet" entityId={projet.id} comments={projet.commentaires ?? []} />
      </main>
    </div>
  );
}
