'use client';

import { useEffect } from 'react';
import { usePublication } from '@/hooks/queries';
import { useParams, notFound } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LikeButton } from '@/components/LikeButton';
import ReadingProgress from '@/components/ReadingProgress';
import CommentSection from '@/components/CommentSection';
import MediaGallery from '@/components/MediaGallery';
import MediaViewer from '@/components/MediaViewer';
import { SectionHeader } from '@/components/SectionHeader';
import { api } from '@/lib/api';
import { processContentImages } from '@/lib/media';
import { Domaine, Like, Media } from '@/types/api';
import { Icons } from '@/components/ui/Icons';

export default function PublicationClient() {
  const params = useParams();
  const { utilisateur } = useAuth();
  const slug = params.slug as string;
  const { data: publication, isLoading, isError } = usePublication(slug);

  useEffect(() => {
    if (publication?.id) {
      api.post('/vues', { page: 'publication', page_id: publication.id }).catch(() => {});
    }
  }, [publication?.id]);

  if (isLoading) return <div className="p-8 text-center text-muted">Chargement...</div>;
  if (isError || !publication) return notFound();

  const liked = utilisateur ? publication.likes?.some((l: Like) => l.auteur_id === utilisateur.id) : false;
  const likesCount = publication.likes?.length ?? 0;
  const readTime = Math.ceil((publication.contenu?.length ?? 0) / 1000);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <ReadingProgress />
      <SectionHeader
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Publications', href: '/publications' },
          { label: publication.titre },
        ]}
        backHref="/publications"
        backLabel="Retour aux publications"
        title={publication.titre}
        actions={
          <span className="text-xs text-muted font-mono">{readTime} min de lecture</span>
        }
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs bg-acid/10 text-acid px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">{publication.type}</span>
          {publication.domaines?.map((d: Domaine) => (
            <span key={d.id} className="text-xs bg-[#222] text-muted px-2 py-0.5 rounded-full" style={d.couleur ? { borderLeft: `3px solid ${d.couleur}` } : {}}>{d.nom}</span>
          ))}
        </div>
      </SectionHeader>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 text-sm text-muted mb-8">
            <span>{publication.publie_le ? new Date(publication.publie_le).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date inconnue'}</span>
            {publication.nombre_vues != null && <span><Icons.search className="w-3.5 h-3.5 inline" aria-hidden /> {publication.nombre_vues}</span>}
            <span>{readTime} min</span>
          </div>

          {publication.image_couverture && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8">
              <MediaViewer src={publication.image_couverture} alt={publication.titre} fill className="object-cover" />
            </div>
          )}

          {publication.medias && publication.medias.length > 0 && (
            <div className="mb-8">
              <MediaGallery
                items={publication.medias.filter((m) => m.chemin_fichier).map((m: Media) => ({
                  id: m.id,
                  url: m.chemin_fichier!,
                  type: m.type,
                  titre: m.titre,
                }))}
              />
            </div>
          )}

          <div className="prose prose-invert max-w-none text-off-white mb-12">
            {publication.contenu_html ? (
              <div dangerouslySetInnerHTML={{ __html: processContentImages(publication.contenu_html) }} />
            ) : (
              <div className="whitespace-pre-wrap">{publication.contenu}</div>
            )}
          </div>

          <div className="flex items-center gap-4 border-t border-[#222] pt-6">
            <LikeButton publicationId={publication.id} initialLiked={liked} initialCount={likesCount} />
          </div>
        </article>

        <CommentSection entityType="publication" entityId={publication.id} comments={publication.commentaires ?? []} />
      </main>
    </div>
  );
}
