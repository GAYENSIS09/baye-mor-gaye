'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useCommentairesEnAttente } from '@/hooks/queries';
import { useApprouverCommentaire, useDeleteCommentaire, useCreateCommentaire } from '@/hooks/mutations';
import type { Commentaire } from '@/types/api';
import ConfirmDialog from '@/components/ConfirmDialog';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useToast } from '@/contexts/ToastContext';
import { SectionHeader } from '@/components/SectionHeader';
import { CardContainer } from '@/components/CardContainer';
import { ActionButton, StatusBadge } from '@/components/ActionBar';
import { Icons } from '@/components/ui/Icons';

export default function CommentairesDashboardPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const { data: commentsRes, isLoading } = useCommentairesEnAttente();
  const comments = commentsRes?.data ?? [];
  const approveCommentaire = useApprouverCommentaire();
  const deleteCommentaire = useDeleteCommentaire();
  const createCommentaire = useCreateCommentaire();
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const toast = useToast();

  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

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

  return (
    <div className="max-w-4xl mx-auto">
      <SectionHeader title="Commentaires en attente" total={comments.length} />

      {isLoading ? (
        <p className="text-muted">Chargement...</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <CardContainer key={c.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-off-white">{c.auteur.nom}</p>
                  <StatusBadge variant="warning" size="sm">En attente</StatusBadge>
                </div>
                <span className="text-xs text-muted">{new Date(c.created_at).toLocaleString('fr-FR')}</span>
              </div>
              <p className="text-off-white mb-2">{c.contenu}</p>
              <p className="text-xs text-muted mb-3">
                Sur {c.commentable_type === 'App\\Models\\Publication' ? 'publication' : 'projet'} : {c.commentable?.titre || `#${c.commentable?.id}`}
              </p>
              <div className="flex gap-2">
                <ActionButton variant="primary" size="sm" onClick={() => approve(c.id)} disabled={pendingIds.has(c.id)}>
                  {pendingIds.has(c.id) ? '...' : 'Approuver'}
                </ActionButton>
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
                  <div className="flex gap-2">
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
              <svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-muted font-mono text-sm">Aucun commentaire en attente.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer le commentaire" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteCommentaire.mutateAsync(confirmDelete); toast.success('Commentaire supprimé'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}