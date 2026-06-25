'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EdtFormSchema, type EdtFormData } from '@/schemas/forms';
import Link from 'next/link';
import { useEdt } from '@/hooks/queries';
import { Evenement } from '@/types/api';
import { useCreateEdt, useToggleEdt, useDeleteEdt, useImportConversion, useDeleteEvenement } from '@/hooks/mutations';
import ConfirmDialog from '@/components/ConfirmDialog';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useToast } from '@/contexts/ToastContext';
import { Icons } from '@/components/ui/Icons';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekLabel(start: Date) {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('fr-FR', opts)} — ${end.toLocaleDateString('fr-FR', opts)}`;
}

export default function EdtDashboardPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [confirmDeleteEvent, setConfirmDeleteEvent] = useState<number | null>(null);
  const { data: edts = [], isLoading, isError, refetch } = useEdt();
  const createEdt = useCreateEdt();
  const toggleEdt = useToggleEdt();
  const deleteEdt = useDeleteEdt();
  const deleteEvenement = useDeleteEvenement();
  const importConversion = useImportConversion();
  const toast = useToast();

  const weekDays = useMemo(() => {
    return DAYS.map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const weekEvents = useMemo(() => {
    const map = new Map<string, any[]>();
    weekDays.forEach((day) => map.set(day.toDateString(), []));
    edts.filter((edt) => edt.est_actif).forEach((edt) => {
      edt.evenements.forEach((e) => {
        const date = new Date(e.date_debut).toDateString();
        if (map.has(date)) {
          map.get(date)!.push({ ...e, edtTitre: edt.titre, couleur: e.couleur || edt.type === 'professionnel' ? '#AAFF00' : null });
        }
      });
    });
    return map;
  }, [weekDays, edts]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EdtFormData>({
    resolver: zodResolver(EdtFormSchema),
    defaultValues: {
      titre: '',
      description: '',
      type: 'personnel',
      est_actif: false,
    },
  });

  async function handleCreate(data: EdtFormData) {
    try {
      await createEdt.mutateAsync(data);
      reset({ titre: '', description: '', type: 'personnel', est_actif: false });
      setShowForm(false);
      toast.success('Emploi du temps créé');
    } catch { toast.error("Erreur lors de la création"); }
  }

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-off-white">Emploi du temps</h1>
        <div className="flex gap-2 max-sm:flex-col max-sm:w-full">
          <button onClick={() => setShowForm(!showForm)}
            className="bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 font-mono text-xs uppercase tracking-widest max-sm:w-full">
            {showForm ? 'Annuler' : 'Nouvel EDT'}
          </button>
          <button onClick={() => setShowImport(!showImport)}
            className="text-sm bg-[#222] text-off-white px-4 py-2 rounded hover:bg-[#333] font-mono text-xs uppercase tracking-widest max-sm:w-full">
            {showImport ? 'Annuler' : 'Importer'}
          </button>
        </div>
      </div>

      {showImport && (
        <div className="bg-[#111] p-4 rounded border border-[#222] mb-6">
          <p className="text-sm text-muted mb-3">Importez une image d'emploi du temps pour une extraction automatique par IA.</p>
          <Link href="/dashboard/edt/importer"
            className="inline-block bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 font-mono text-xs uppercase tracking-widest transition-colors">
            Ouvrir l'import IA
          </Link>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit(handleCreate)} noValidate className="bg-[#111] p-4 rounded border border-[#222] mb-6 space-y-3">
          <div>
            <input {...register("titre")} placeholder="Titre" required
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
            {errors.titre && <p className="text-red-400 text-xs mt-1">{errors.titre.message}</p>}
          </div>
          <div>
            <textarea {...register("description")} placeholder="Description"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none" rows={2} />
          </div>
          <div>
            <select {...register("type")}
              className="w-full border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white focus-visible:outline-none">
              <option value="professionnel">Professionnel</option>
              <option value="academique">Académique</option>
              <option value="personnel">Personnel</option>
            </select>
            {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="bg-acid text-black px-4 py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest">
            {isSubmitting ? 'Création...' : 'Créer'}
          </button>
        </form>
      )}

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }}
          className="text-sm text-muted hover:text-off-white font-mono transition-colors" aria-label="Semaine précédente">
          <span className="hidden md:inline">← Semaine précédente</span>
          <span className="md:hidden" aria-hidden="true">←</span>
        </button>
        <span className="text-sm text-off-white font-mono">{formatWeekLabel(weekStart)}</span>
        <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }}
          className="text-sm text-muted hover:text-off-white font-mono transition-colors" aria-label="Semaine suivante">
          <span className="hidden md:inline">Semaine suivante →</span>
          <span className="md:hidden" aria-hidden="true">→</span>
        </button>
      </div>

      {/* Calendar grid */}
      {isError ? (
        <div className="text-center py-16">
          <p className="text-muted text-sm mb-4">Erreur chargement EDT</p>
          <button onClick={() => refetch()} className="bg-acid text-black px-4 py-2 font-mono text-xs uppercase rounded hover:bg-acid/90">Réessayer</button>
        </div>
      ) : isLoading ? (
        <p className="text-muted">Chargement...</p>
      ) : (
        <>
          <div className="hidden md:grid grid-cols-7 gap-px bg-[#222] rounded-lg overflow-hidden mb-8">
            {weekDays.map((day, i) => {
              const dateStr = day.toDateString();
              const events = weekEvents.get(dateStr) || [];
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={i} className={`bg-[#111] min-h-[120px] p-2 ${isToday ? 'ring-1 ring-acid/50' : ''}`}>
                  <div className="text-center mb-1">
                    <p className="text-xs text-muted font-mono">{DAYS[i]}</p>
                    <p className={`text-sm font-mono ${isToday ? 'text-acid font-bold' : 'text-off-white'}`}>{day.getDate()}</p>
                  </div>
                  <div className="space-y-1">
                    {events.slice(0, 3).map((e, j: number) => (
                      <div key={j} className="text-[10px] px-1 py-0.5 rounded truncate" style={{ backgroundColor: e.couleur ? `${e.couleur}20` : '#222', color: e.couleur || '#888' }}>
                        {(e as any).type && <span className="uppercase mr-0.5 opacity-70">{(e as any).type}</span>}
                        {new Date(e.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} {e.titre}
                        {e.lieu && <span className="opacity-50 ml-0.5">· {e.lieu}</span>}
                      </div>
                    ))}
                    {events.length > 3 && <p className="text-[10px] text-muted text-center">+{events.length - 3}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile agenda view */}
          <div className="md:hidden space-y-3 mb-8">
            {weekDays.map((day, i) => {
              const dateStr = day.toDateString();
              const events = weekEvents.get(dateStr) || [];
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={i} className={`bg-[#111] rounded border border-[#222] p-3 ${isToday ? 'ring-1 ring-acid/50' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs text-muted font-mono">{DAYS[i]}</p>
                    <p className={`text-sm font-mono ${isToday ? 'text-acid font-bold' : 'text-off-white'}`}>{day.getDate()}</p>
                  </div>
                  {events.length > 0 ? (
                    <div className="space-y-1">
                      {events.map((e, j) => (
                        <div key={j} className="text-xs px-2 py-1 rounded whitespace-normal" style={{ backgroundColor: e.couleur ? `${e.couleur}20` : '#222', color: e.couleur || '#888' }}>
                          <span className="font-semibold">{new Date(e.date_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span> {e.titre}
                          {e.lieu && <span className="opacity-50 ml-1">· {e.lieu}</span>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted">Aucun événement</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* EDT list */}
          <div className="space-y-4">
            {edts.map((edt) => (
              <div key={edt.id} className="bg-[#111] rounded border border-[#222]">
                <div className="p-4 flex items-center justify-between border-b border-[#222]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-off-white">{edt.titre}</h2>
                      <span className="text-xs bg-[#222] text-muted px-2 py-0.5 rounded">{edt.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${edt.est_actif ? 'bg-green-900/20 text-green-400' : 'bg-[#222] text-muted'}`}>
                        {edt.est_actif ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    {edt.description && <p className="text-sm text-muted">{edt.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleEdt.mutateAsync({ id: edt.id, est_actif: !edt.est_actif })}
                      className="text-sm text-acid hover:text-acid/80">{edt.est_actif ? 'Désactiver' : 'Activer'}</button>
                    <button onClick={() => setConfirmDelete(edt.id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors rounded hover:bg-red-400/10" aria-label="Supprimer"><Icons.trash className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Événements</h3>
                      <Link href="/dashboard/edt/importer" className="text-xs text-acid/70 hover:text-acid font-mono transition-colors">
                        Import IA
                      </Link>
                    </div>
                    <Link href={`/dashboard/edt/evenements/new?edt_id=${edt.id}`} className="text-sm text-acid hover:text-acid/80">
                      + Ajouter
                    </Link>
                  </div>
                  {edt.evenements.length > 0 ? (
                    <div className="space-y-1">
                        {edt.evenements.map((e: Evenement) => (
                        <div key={e.id} className="group flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-sm px-3 py-2 bg-[#0A0A0A] rounded">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 flex-1 min-w-0">
                            {e.couleur && <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.couleur }} />}
                            {(e as any).type && <span className="text-[10px] uppercase px-1 py-0.5 rounded bg-[#222] text-muted font-mono shrink-0">{(e as any).type}</span>}
                            <span className="text-off-white truncate">{e.titre}</span>
                            <span className="text-muted shrink-0">
                              {new Date(e.date_debut).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {e.lieu && <span className="text-muted shrink-0">· {e.lieu}</span>}
                          </div>
                          <div className="flex items-center gap-2 sm:ml-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              e.statut === 'confirme' ? 'bg-green-900/20 text-green-400' :
                              e.statut === 'termine' ? 'bg-acid/10 text-acid' :
                              e.statut === 'annule' ? 'bg-red-900/20 text-red-400' :
                              'bg-yellow-900/20 text-yellow-400'
                            }`}>{e.statut}</span>
                            <Link href={`/dashboard/edt/evenements/${e.id}/edit`}
                              className="text-xs text-acid hover:text-acid/80 font-mono">
                              ✎
                            </Link>
                            <button onClick={() => setConfirmDeleteEvent(e.id)}
                              className="text-xs text-red-400 hover:text-red-300 font-mono lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div className="text-center py-12"><svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-muted font-mono text-sm">Aucun événement.</p></div>}
                </div>
              </div>
            ))}
            {edts.length === 0 && <div className="text-center py-12"><svg className="w-10 h-10 mx-auto text-muted/30 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg><p className="text-muted font-mono text-sm">Aucun emploi du temps.</p></div>}
          </div>
        </>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Supprimer l'EDT" message="Tous les événements associés seront supprimés." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDelete) { try { await deleteEdt.mutateAsync(confirmDelete); toast.success('Emploi du temps supprimé'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDelete(null); } } } onCancel={() => setConfirmDelete(null)} />

      <ConfirmDialog open={confirmDeleteEvent !== null} title="Supprimer l'événement" message="Cette action est irréversible." destructive confirmLabel="Supprimer" onConfirm={async () => { if (confirmDeleteEvent) { try { await deleteEvenement.mutateAsync(confirmDeleteEvent); toast.success('Événement supprimé'); } catch { toast.error('Erreur lors de la suppression'); } setConfirmDeleteEvent(null); } } } onCancel={() => setConfirmDeleteEvent(null)} />
    </div>
  );
}
