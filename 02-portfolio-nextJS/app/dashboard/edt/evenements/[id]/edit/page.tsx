'use client';

import { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEdt } from '@/hooks/queries';
import { useUpdateEvenement } from '@/hooks/mutations';
import { LoadingScreen } from '@/components/LoadingScreen';
import { api } from '@/lib/api';
import type { Evenement } from '@/types/api';

function EditEvenementForm() {
  const { utilisateur, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const { data: edts = [] } = useEdt();
  const updateEvenement = useUpdateEvenement();
  const [loading, setLoading] = useState(true);
  const [emploiDuTempsId, setEmploiDuTempsId] = useState('');
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [lieu, setLieu] = useState('');
  const [couleur, setCouleur] = useState('#3b82f6');
  const [estJourneeComplete, setEstJourneeComplete] = useState(false);
  const [statut, setStatut] = useState('planifie');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && utilisateur && id) {
      api.get<Evenement>(`/evenements/${id}`).then((evenement) => {
        setEmploiDuTempsId(String(evenement.emploi_du_temps_id));
        setTitre(evenement.titre);
        setDescription(evenement.description ?? '');
        setDateDebut(toDatetimeLocal(evenement.date_debut));
        setDateFin(evenement.date_fin ? toDatetimeLocal(evenement.date_fin) : '');
        setLieu(evenement.lieu ?? '');
        setCouleur(evenement.couleur ?? '#3b82f6');
        setEstJourneeComplete(evenement.est_journee_complete ?? false);
        setStatut(evenement.statut);
        setLoading(false);
      }).catch(() => {
        router.push('/dashboard/edt');
      });
    }
  }, [authLoading, utilisateur, id, router]);

  function toDatetimeLocal(dateStr: string) {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateEvenement.mutateAsync({
        id,
        emploi_du_temps_id: parseInt(emploiDuTempsId),
        titre,
        description: description || undefined,
        date_debut: dateDebut,
        date_fin: dateFin || undefined,
        lieu: lieu || undefined,
        couleur,
        est_journee_complete: estJourneeComplete,
        statut,
      });
      router.push('/dashboard/edt');
    } catch {
      console.error('Erreur modification evenement');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) return <LoadingScreen />;
  if (!utilisateur) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-off-white">Modifier evenement</h1>
      <form onSubmit={handleSubmit} className="w-full bg-[#111] p-6 rounded border border-[#222] space-y-4">
        <div>
          <label htmlFor="emploi-du-temps" className="block text-sm font-medium text-off-white">Emploi du temps</label>
          <select id="emploi-du-temps" name="emploi_du_temps_id" value={emploiDuTempsId} onChange={(e) => setEmploiDuTempsId(e.target.value)} required
            className="w-full border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50">
            <option value="">Selectionner...</option>
            {edts.map((edt) => (
              <option key={edt.id} value={edt.id}>{edt.titre}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="titre" className="block text-sm font-medium text-off-white">Titre</label>
          <input id="titre" name="titre" value={titre} onChange={(e) => setTitre(e.target.value)} required autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-off-white">Description</label>
          <textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="date-debut" className="block text-sm font-medium text-off-white">Date debut</label>
            <input id="date-debut" name="date_debut" type="datetime-local" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} required autoComplete="off"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          </div>
          <div>
            <label htmlFor="date-fin" className="block text-sm font-medium text-off-white">Date fin</label>
            <input id="date-fin" name="date_fin" type="datetime-local" value={dateFin} onChange={(e) => setDateFin(e.target.value)} autoComplete="off"
              className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          </div>
        </div>
        <div>
          <label htmlFor="lieu" className="block text-sm font-medium text-off-white">Lieu</label>
          <input id="lieu" name="lieu" value={lieu} onChange={(e) => setLieu(e.target.value)} autoComplete="off"
            className="w-full border border-[#333] rounded px-3 py-2 bg-transparent text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label htmlFor="statut" className="block text-sm font-medium text-off-white">Statut</label>
            <select id="statut" name="statut" value={statut} onChange={(e) => setStatut(e.target.value)}
              className="w-full border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50">
              <option value="planifie">Planifié</option>
              <option value="confirme">Confirmé</option>
              <option value="termine">Terminé</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
          <div>
            <label htmlFor="couleur" className="block text-sm font-medium text-off-white">Couleur</label>
            <input id="couleur" name="couleur" type="color" value={couleur} onChange={(e) => setCouleur(e.target.value)}
              className="w-10 h-10 border border-[#333] rounded bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="journee" name="est_journee_complete" checked={estJourneeComplete}
              onChange={(e) => setEstJourneeComplete(e.target.checked)} className="accent-acid" />
            <label htmlFor="journee" className="text-sm text-off-white">Journee complete</label>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button type="submit" disabled={saving}
            className="bg-acid text-black px-6 py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest">
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="bg-[#222] text-off-white px-6 py-2 rounded hover:bg-[#333] font-mono text-xs uppercase tracking-widest">
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditEvenementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Chargement...</div>}>
      <EditEvenementForm />
    </Suspense>
  );
}
