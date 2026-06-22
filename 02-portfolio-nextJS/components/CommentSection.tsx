'use client';

import { useState } from 'react';
import { useCreateCommentaire } from '@/hooks/mutations';
import { useAuth } from '@/contexts/AuthContext';
import { ActionButton } from '@/components/ActionBar';
import { Commentaire } from '@/types/api';
import Link from 'next/link';

interface CommentSectionProps {
  entityType: 'publication' | 'projet';
  entityId: number;
  comments: Commentaire[];
}

export default function CommentSection({ entityType, entityId, comments }: CommentSectionProps) {
  const { utilisateur } = useAuth();
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; auteur: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const commentMutation = useCreateCommentaire();

  const approved = comments.filter((c) => c.est_approuve);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    try {
      await commentMutation.mutateAsync({ commentable_type: entityType, commentable_id: entityId, contenu: content });
      setContent('');
    } catch { console.error('Erreur commentaire'); }
  }

  async function handleReply(parentId: number) {
    if (!replyContent.trim()) return;
    try {
      await commentMutation.mutateAsync({ commentable_type: entityType, commentable_id: entityId, contenu: replyContent, parent_id: parentId });
      setReplyContent('');
      setReplyTo(null);
    } catch { console.error('Erreur réponse'); }
  }

  return (
    <section className="max-w-3xl mx-auto mt-12">
      <h2 className="text-xl font-bold mb-6 text-off-white">Commentaires ({approved.length})</h2>

      {utilisateur ? (
        <form onSubmit={handleComment} className="bg-[#111] p-4 rounded border border-[#222] mb-6">
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Votre commentaire..." required rows={3}
            className="input-base mb-2" />
          <ActionButton type="submit" disabled={commentMutation.isPending} variant="primary">
            {commentMutation.isPending ? 'Envoi...' : 'Commenter'}
          </ActionButton>
        </form>
      ) : (
        <div className="bg-[#111] p-4 rounded border border-[#222] mb-6 text-center">
          <p className="text-muted text-sm">
            <Link href="/login" className="text-acid hover:underline">Connectez-vous</Link> pour commenter
          </p>
        </div>
      )}

      <div className="space-y-3">
        {approved.map((c) => (
          <div key={c.id} className="bg-[#111] p-4 rounded border border-[#222]">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-full bg-acid/20 text-acid flex items-center justify-center text-xs font-bold">
                {c.auteur.nom.charAt(0).toUpperCase()}
              </span>
              <p className="text-sm font-semibold text-off-white">{c.auteur.nom}</p>
              <span className="text-xs text-muted">{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
            <p className="text-off-white ml-9">{c.contenu}</p>
            {utilisateur && (
              <button onClick={() => setReplyTo(replyTo?.id === c.id ? null : { id: c.id, auteur: c.auteur.nom })}
                className="text-xs text-acid hover:text-acid/80 mt-1 ml-9">
                Répondre
              </button>
            )}
            {replyTo?.id === c.id && (
              <div className="mt-2 ml-9 border-t border-[#222] pt-2">
                <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Répondre à ${replyTo.auteur}...`} rows={2}
                  className="input-base text-sm mb-2" />
                <div className="flex gap-2">
                  <ActionButton onClick={() => handleReply(c.id)} variant="primary" size="sm">Envoyer</ActionButton>
                  <ActionButton onClick={() => { setReplyTo(null); setReplyContent(''); }} variant="ghost" size="sm">Annuler</ActionButton>
                </div>
              </div>
            )}
          </div>
        ))}
        {approved.length === 0 && (
          <p className="text-muted text-sm text-center py-8">
            {entityType === 'publication' ? 'Aucun commentaire. Soyez le premier à commenter !' : 'Aucun commentaire.'}
          </p>
        )}
      </div>
    </section>
  );
}
