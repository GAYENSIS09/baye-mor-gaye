'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useStatistiques } from '@/hooks/queries';
import { Skeleton } from '@/components/Skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { useState } from 'react';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Icons } from '@/components/ui/Icons';

const PERIODES = [
  { value: '7d', label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '3m', label: '3 mois' },
  { value: '1a', label: '1 an' },
];

export default function StatistiquesDashboardPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const [periode, setPeriode] = useState('7d');
  const { data: stats, isLoading } = useStatistiques(periode);

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  const totaux = stats?.totaux;

  const cards = [
    { label: 'Vues', value: totaux?.vues ?? 0 },
    { label: 'Publications', value: totaux?.publications ?? 0 },
    { label: 'Projets', value: totaux?.projets ?? 0 },
    { label: 'Likes', value: totaux?.likes ?? 0 },
    { label: 'Messages non lus', value: totaux?.messages_non_lus ?? 0 },
    { label: 'Commentaires en attente', value: totaux?.commentaires_en_attente ?? 0 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-off-white">Statistiques</h1>
        <div className="flex gap-1 bg-[#111] border border-[#222] rounded-lg p-1">
          {PERIODES.map((p) => (
            <button key={p.value} onClick={() => setPeriode(p.value)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md transition-colors ${
                periode === p.value
                  ? 'bg-acid text-black font-semibold'
                  : 'text-muted hover:text-off-white'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#111] p-4 rounded border border-[#222] space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-12" />
              </div>
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cards.map((card) => (
              <div key={card.label} className="bg-[#111] p-4 rounded border border-[#222]">
                <p className="text-xs text-muted font-mono uppercase tracking-wider">{card.label}</p>
                <p className="text-2xl font-bold mt-1 text-off-white">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111] p-6 rounded border border-[#222]">
              <h2 className="text-lg font-semibold text-off-white mb-4">Vues par jour</h2>
              {(stats?.vues_par_jour?.length ?? 0) > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats!.vues_par_jour}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="date" stroke="#888880" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#888880" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#F5F5F0' }}
                      labelStyle={{ color: '#F5F5F0' }}
                    />
                    <Line type="monotone" dataKey="total" stroke="#AAFF00" strokeWidth={2} dot={false} name="Vues" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12"><svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-muted font-mono text-sm">Aucune donnée pour cette période</p></div>
              )}
            </div>

            <div className="bg-[#111] p-6 rounded border border-[#222]">
              <h2 className="text-lg font-semibold text-off-white mb-4">Répartition</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: 'Publications', value: totaux?.publications ?? 0 },
                  { name: 'Projets', value: totaux?.projets ?? 0 },
                  { name: 'Messages\nnon lus', value: totaux?.messages_non_lus ?? 0 },
                  { name: 'Commentaires\nen attente', value: totaux?.commentaires_en_attente ?? 0 },
                ]}>
                  <XAxis dataKey="name" stroke="#888880" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#888880" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#F5F5F0' }}
                    labelStyle={{ color: '#F5F5F0' }}
                  />
                  <Bar dataKey="value" fill="#AAFF00" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111] p-6 rounded border border-[#222]">
              <h2 className="text-lg font-semibold text-off-white mb-4">Top publications</h2>
              {(stats?.top_publications?.length ?? 0) > 0 ? (
                <div className="space-y-2">
                  {stats!.top_publications.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 p-2 rounded hover:bg-[#1a1a1a]">
                      <span className="text-xs font-mono text-muted w-5">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-off-white truncate">{p.titre}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span title="Likes"><Icons.star className="w-3 h-3 inline" aria-hidden /> {p.likes_count}</span>
                        <span title="Commentaires"><Icons.chat className="w-3 h-3 inline" aria-hidden /> {p.commentaires_count}</span>
                        <span title="Vues"><Icons.search className="w-3 h-3 inline" aria-hidden /> {p.vuepages_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12"><svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-muted font-mono text-sm">Aucune publication</p></div>
              )}
            </div>

            <div className="bg-[#111] p-6 rounded border border-[#222]">
              <h2 className="text-lg font-semibold text-off-white mb-4">Top projets</h2>
              {(stats?.top_projets?.length ?? 0) > 0 ? (
                <div className="space-y-2">
                  {stats!.top_projets.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 p-2 rounded hover:bg-[#1a1a1a]">
                      <span className="text-xs font-mono text-muted w-5">{i + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-off-white truncate">{p.titre}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span title="Likes"><Icons.star className="w-3 h-3 inline" aria-hidden /> {p.likes_count}</span>
                        <span title="Commentaires"><Icons.chat className="w-3 h-3 inline" aria-hidden /> {p.commentaires_count}</span>
                        <span title="Vues"><Icons.search className="w-3 h-3 inline" aria-hidden /> {p.vuepages_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12"><svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-muted font-mono text-sm">Aucun projet</p></div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
