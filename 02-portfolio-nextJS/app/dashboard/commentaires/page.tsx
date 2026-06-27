'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useCommentairesEnAttente, useMesCommentaires } from '@/hooks/queries';
import { useApprouverCommentaire, useDeleteCommentaire, useCreateCommentaire } from '@/hooks/mutations';
import type { Commentaire } from '@/types/api';
import { getMediaUrl } from '@/lib/media';
import ConfirmDialog from '@/components/ConfirmDialog';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useToast } from '@/contexts/ToastContext';
import { SectionHeader } from '@/components/SectionHeader';
import { CardContainer } from '@/components/CardContainer';
import { ActionButton, StatusBadge } from '@/components/ActionBar';
import { Icons } from '@/components/ui/Icons';
import MediaViewer from '@/components/MediaViewer';

export default function CommentairesDashboardPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const isOwner = !!utilisateur?.proprietaire;

  const { data: pendingRes, isLoading: pendingLoading } = useCommentairesEnAttente(undefined, isOwner);
  const { data: myCommentsRes, isLoading: myCommentsLoading } = useMesCommentaires();

  const approveCommentaire = useApprouverCommentaire();
  const deleteCommentaire = useDeleteCommentaire();
  const createCommentaire = useCreateCommentaire();
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const toast = useToast();

  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const comments = isOwner ? (pendingRes?.data ?? []) : (myCommentsRes?.data ?? []);
  const isLoading = isOwner ? pendingLoading : myCommentsLoading;

  async function approve(id: number) {
    setPendingIds(prev => new Set(prev).add(id));
    try {
      await approveCommentaire.mutateAsync(id);
      toast.success('Commentaire approuvé');
    } catch {
      toast.error("Erreur lors de l'approbation");
    } finally {
      setPendingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    }
  }

  async function remove(id: number) {
    setPendingIds(prev => new Set(prev).add(id));
    try {
      await deleteCommentaire.mutateAsync(id);
      toast.success('Commentaire supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setPendingIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    }
  }

  async function handleReply(c: Commentaire) {
    if (!replyContent.trim()) return;
    try {
      await createCommentaire.mutateAsync({
        contenu: replyContent,
        commentable_type: c.commentable_type,
        commentable_id: c.commentable_id,
        parent_id: c.id,
      });
      setReplyContent('');
      setReplyTo(null);
      toast.success('Réponse envoyée');
    } catch {
      toast.error("Erreur lors de l'envoi de la réponse");
    }
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  const title = isOwner ? 'Commentaires en attente' : 'Mes commentaires';

  return (
    <div className="max-w-4xl mx-auto">
      <SectionHeader title={title} total={comments.length} />

      {isLoading ? (
        <p className="text-muted">Chargement...</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <CardContainer key={c.id} className="p-4">
              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {c.auteur?.photo ? (
                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                      <MediaViewer src={getMediaUrl(c.auteur.photo) || ''} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#222] flex items-center justify-center text-xs text-muted font-mono">
                      {c.auteur?.nom?.charAt(0) || '?'}
                    </div>
                  )}
                  <p className="font-semibold text-sm text-off-white">{c.auteur?.nom || 'Anonyme'}</p>
                  {!c.est_approuve && <StatusBadge variant="warning" size="sm">En attente</StatusBadge>}
                </div>
                <span className="text-xs text-muted">{new Date(c.created_at).toLocaleString('fr-FR')}</span>
              </div>
              <p className="text-off-white mb-2">{c.contenu}</p>
              <p className="text-xs text-muted mb-3">
                Sur {c.commentable_type === 'App\\Models\\Publication' ? 'publication' : 'projet'} : {c.commentable?.titre || `#${c.commentable?.id}`}
              </p>
              <div className="flex gap-2 flex-wrap">
                {isOwner && (
                  <ActionButton variant="primary" size="sm" onClick={() => approve(c.id)} disabled={pendingIds.has(c.id)}>
                    {pendingIds.has(c.id) ? '...' : 'Approuver'}
                  </ActionButton>
                )}
                <ActionButton variant="ghost" size="sm" onClick={() => setConfirmDelete(c.id)} disabled={pendingIds.has(c.id)}>
                  <Icons.trash className="w-4 h-4 inline mr-1" /> Supprimer
                </ActionButton>
                <ActionButton variant="secondary" size="sm" onClick={() => setReplyTo(replyTo === c.id ? null : c.id)} disabled={pendingIds.has(c.id)}>
                  Répondre
                </ActionButton>
              </div>
              {replyTo === c.id && (
                <div className="mt-3 border-t border-[#222] pt-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Votre réponse..." rows={2}
                    className="w-full border border-[#333] rounded px-3 py-2 mb-2 bg-transparent text-off-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50"
                  />
                  <div className="flex gap-2 flex-wrap">
                    <ActionButton variant="primary" size="sm" onClick={() => handleReply(c)}>
                      Envoyer
                    </ActionButton>
                    <ActionButton variant="ghost" size="sm" onClick={() => { setReplyTo(null); setReplyContent(''); }}>
                      Annuler
                    </ActionButton>
                  </div>
                </div>
              )}
            </CardContainer>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-12">
              <Icons.chat className="w-10 h-10 mx-auto text-muted/30 mb-3" />
              <p className="text-muted font-mono text-sm">
                {isOwner ? 'Aucun commentaire en attente.' : 'Vous n\'avez pas encore de commentaire.'}
              </p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer le commentaire" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteCommentaire.mutateAsync(confirmDelete); toast.success('Commentaire supprimé'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}