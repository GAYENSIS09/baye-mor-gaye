'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useStatistiques, useCommentairesEnAttente } from '@/hooks/queries';
import { Skeleton } from '@/components/Skeleton';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import type { Commentaire } from '@/types/api';
import { CardContainer, CardContent, CardTitle } from '@/components/CardContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { ResponsiveGrid } from '@/components/ResponsiveGrid';

import { Icons } from '@/components/ui/Icons';

function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  return (
    <CardContainer href={href} hover className="p-4">
      <CardContent className="p-0 space-y-1">
        <p className="text-xs text-muted font-mono uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-off-white">{value}</p>
      </CardContent>
    </CardContainer>
  );
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
      <SectionHeader
        title="Tableau de bord"
        actions={
          <Link href="/dashboard/profil" className="text-xs text-muted hover:text-acid font-mono transition-colors">
            Modifier le profil →
          </Link>
        }
      />

      {/* StatsGrid */}
      {statsLoading ? (
        <ResponsiveGrid columns={4} gap={4} className="mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardContainer key={i} className="animate-pulse p-4">
              <CardContent className="p-0 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </CardContainer>
          ))}
        </ResponsiveGrid>
      ) : (
        <ResponsiveGrid columns={4} gap={4} className="mb-8">
          <StatCard label="Projets" value={totaux?.projets ?? 0} href="/dashboard/projets" />
          <StatCard label="Publications" value={totaux?.publications ?? 0} href="/dashboard/publications" />
          <StatCard label="Vues (7j)" value={totaux?.vues ?? 0} href="/dashboard/statistiques" />
          <StatCard label="Messages non lus" value={totaux?.messages_non_lus ?? 0} href="/dashboard/messages" />
        </ResponsiveGrid>
      )}

      <ResponsiveGrid columns={2} gap={6}>
        {/* VuesSemaine */}
        <CardContainer className="p-6">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-lg">Vues cette semaine</CardTitle>
            <Link href="/dashboard/statistiques" className="text-xs text-muted hover:text-acid font-mono transition-colors">
              Voir plus →
            </Link>
          </div>
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
        </CardContainer>

        {/* CommentairesEnAttente */}
        <CardContainer className="p-6">
          <CardTitle className="text-lg flex items-center gap-2">
            Commentaires en attente
            {enAttente.length > 0 && (
              <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-mono">{enAttente.length}</span>
            )}
          </CardTitle>
          {commentairesLoading ? (
            <div className="space-y-3 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded animate-pulse">
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
            <div className="space-y-2 mt-4">
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
        </CardContainer>
      </ResponsiveGrid>

      {/* Navigation cards */}
      <SectionHeader title="Accès rapide" subtitle="Naviguez vers les sections principales" />
      <ResponsiveGrid columns={4} gap={4} className="mt-4">
        {[
          { href: '/dashboard/competences', label: 'Compétences', icon: Icons.star },
          { href: '/dashboard/domaines', label: 'Domaines', icon: Icons.tag },
          { href: '/dashboard/edt', label: 'Emploi du temps', icon: Icons.calendar },
          { href: '/dashboard/ressources', label: 'Ressources', icon: Icons.document },
          { href: '/dashboard/notifications', label: 'Notifications', icon: Icons.bell },
          { href: '/dashboard/rappels', label: 'Rappels', icon: Icons.alarm },
          { href: '/dashboard/certifications', label: 'Certifications', icon: Icons.badge },
          { href: '/dashboard/formations', label: 'Formations', icon: Icons.academic },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <CardContainer hover className="p-3 text-center">
              <CardContent className="p-0 flex flex-col items-center gap-2">
                <span className="w-10 h-10 flex items-center justify-center bg-[#222] rounded-lg text-acid" aria-hidden="true">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="text-sm text-off-white">{label}</span>
              </CardContent>
            </CardContainer>
          </Link>
        ))}
      </ResponsiveGrid>
    </div>
  );
}