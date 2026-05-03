'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useStatistiques, useCommentairesEnAttente } from '@/hooks/queries';
import { Skeleton } from '@/components/Skeleton';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import type { Commentaire } from '@/types/api';

function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  const inner = (
    <div className="bg-[#111] p-4 rounded border border-[#222] hover:border-acid/30 transition">
      <p className="text-xs text-muted font-mono uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold mt-1 text-off-white">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function DashboardPage() {
  const { utilisateur, loading } = useAuth();
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useStatistiques('7d');
  const { data: commentairesData, isLoading: commentairesLoading } = useCommentairesEnAttente();

  useEffect(() => {
    if (!loading && !utilisateur) {
      router.push('/login');
    }
  }, [utilisateur, loading, router]);

  if (loading) return <div className="p-8 text-center text-muted">Chargement...</div>;
  if (!utilisateur) return null;

  const totaux = stats?.totaux;
  const enAttente = commentairesData?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-off-white">Tableau de bord</h1>
        <Link href="/dashboard/profil" className="text-xs text-muted hover:text-acid font-mono transition-colors">
          Modifier le profil →
        </Link>
      </div>

      {/* StatsGrid */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[#111] p-4 rounded border border-[#222] space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Projets" value={totaux?.projets ?? 0} href="/dashboard/projets" />
          <StatCard label="Publications" value={totaux?.publications ?? 0} href="/dashboard/publications" />
          <StatCard label="Vues (7j)" value={totaux?.vues ?? 0} href="/dashboard/statistiques" />
          <StatCard label="Messages non lus" value={totaux?.messages_non_lus ?? 0} href="/dashboard/messages" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VuesSemaine */}
        <div className="bg-[#111] p-6 rounded border border-[#222]">
          <h2 className="text-lg font-semibold text-off-white mb-4">Vues cette semaine</h2>
          {statsLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (stats?.vues_par_jour?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats!.vues_par_jour}>
                <XAxis dataKey="date" stroke="#888880" tick={{ fontSize: 11 }} />
                <YAxis stroke="#888880" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#F5F5F0' }} />
                <Bar dataKey="total" fill="#AAFF00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted text-sm py-12 text-center">Aucune donnée</p>
          )}
          <div className="mt-3 text-right">
            <Link href="/dashboard/statistiques" className="text-xs text-muted hover:text-acid font-mono transition-colors">
              Voir plus →
            </Link>
          </div>
        </div>

        {/* CommentairesEnAttente */}
        <div className="bg-[#111] p-6 rounded border border-[#222]">
          <h2 className="text-lg font-semibold text-off-white mb-4">
            Commentaires en attente
            {enAttente.length > 0 && (
              <span className="ml-2 text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-mono">{enAttente.length}</span>
            )}
          </h2>
          {commentairesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : enAttente.length === 0 ? (
            <p className="text-muted text-sm py-12 text-center">Aucun commentaire en attente</p>
          ) : (
            <div className="space-y-2">
              {enAttente.slice(0, 5).map((c: Commentaire) => (
                <div key={c.id} className="flex items-start gap-3 p-3 rounded hover:bg-[#1a1a1a] transition-colors">
                  <div className="w-8 h-8 bg-[#222] rounded-full flex items-center justify-center text-xs text-muted font-mono flex-shrink-0">
                    {c.auteur?.nom?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-off-white truncate">{c.contenu}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {c.auteur?.nom || 'Anonyme'} · {new Date(c.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
              {enAttente.length > 5 && (
                <div className="text-center pt-2">
                  <Link href="/dashboard/commentaires" className="text-xs text-muted hover:text-acid font-mono transition-colors">
                    +{enAttente.length - 5} autres →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
        {[
          { href: '/dashboard/competences', label: 'Compétences' },
          { href: '/dashboard/domaines', label: 'Domaines' },
          { href: '/dashboard/edt', label: 'Emploi du temps' },
          { href: '/dashboard/ressources', label: 'Ressources' },
          { href: '/dashboard/notifications', label: 'Notifications' },
          { href: '/dashboard/rappels', label: 'Rappels' },
          { href: '/dashboard/certifications', label: 'Certifications' },
          { href: '/dashboard/formations', label: 'Formations' },
        ].map(({ href, label }) => (
          <Link key={href} href={href}
            className="bg-[#111] p-3 rounded border border-[#222] hover:border-acid/30 transition text-center">
            <span className="text-sm text-off-white">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
