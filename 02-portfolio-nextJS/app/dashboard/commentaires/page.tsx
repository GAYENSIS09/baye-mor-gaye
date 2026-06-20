'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCommentairesEnAttente } from '@/hooks/queries';
import { useApprouverCommentaire, useDeleteCommentaire, useCreateCommentaire } from '@/hooks/mutations';
import { Commentaire } from '@/types/api';
import ConfirmDialog from '@/components/ConfirmDialog';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useToast } from '@/contexts/ToastContext';
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

  async function approve(id: number) {
    try {
      await approveCommentaire.mutateAsync(id);
      toast.success('Commentaire approuvé');
    } catch {
      toast.error("Erreur lors de l'approbation");
    }
  }

  async function remove(id: number) {
    try {
      await deleteCommentaire.mutateAsync(id);
      toast.success('Commentaire supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-off-white">Commentaires en attente</h1>
      </div>

      {isLoading ? (
        <p className="text-muted">Chargement...</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="bg-[#111] p-4 rounded border border-[#222]">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm text-off-white">{c.auteur.nom}</p>
                <span className="text-xs text-muted">{new Date(c.created_at).toLocaleString('fr-FR')}</span>
              </div>
              <p className="text-off-white mb-2">{c.contenu}</p>
              <p className="text-xs text-muted mb-3">
                Sur {c.commentable_type === 'App\\Models\\Publication' ? 'publication' : 'projet'} : {c.commentable?.titre || `#${c.commentable?.id}`}
              </p>
              <div className="flex gap-2">
                <button onClick={() => approve(c.id)}
                  className="bg-green-900/20 text-green-400 px-4 py-1 rounded text-sm hover:bg-green-900/40">
                  Approuver
                </button>
                <button onClick={() => setConfirmDelete(c.id)}
                  className="p-2 text-red-400 hover:text-red-300 transition-colors rounded hover:bg-red-400/10" aria-label="Supprimer">
                  <Icons.trash className="w-4 h-4" />
                </button>
                <button onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                  className="bg-blue-900/20 text-blue-400 px-4 py-1 rounded text-sm hover:bg-blue-900/40">
                  Répondre
                </button>
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
                    <button onClick={() => handleReply(c)}
                      className="bg-acid text-black px-3 py-1 rounded text-xs hover:bg-acid/90 font-mono uppercase tracking-widest">
                      Envoyer
                    </button>
                    <button onClick={() => { setReplyTo(null); setReplyContent(''); }}
                      className="text-xs text-muted hover:text-off-white">
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {comments.length === 0 && <div className="text-center py-12"><svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-muted font-mono text-sm">Aucun commentaire en attente.</p></div>}
        </div>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer le commentaire" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteCommentaire.mutateAsync(confirmDelete); toast.success('Commentaire supprimé'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}
