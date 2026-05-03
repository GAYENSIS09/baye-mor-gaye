'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEdt, useConversions } from '@/hooks/queries';
import { useEdtImport } from '@/hooks/mutations';
import Link from 'next/link';
import { LoadingScreen } from '@/components/LoadingScreen';
import type { Evenement } from '@/types/api';

export default function ImporterEdtPage() {
  const { utilisateur, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data: edts = [] } = useEdt();
  const { data: conversionsData, refetch } = useConversions();
  const conversions = conversionsData?.data ?? [];
  const importMutation = useEdtImport();
  const [edtId, setEdtId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');

  if (authLoading) return <LoadingScreen />;
  if (!utilisateur) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError('');
    setResult(null);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else { setPreview(''); }
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !edtId) return;
    setImporting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('fichier', file);
      fd.append('edt_id', edtId);
      const res = await importMutation.mutateAsync(fd) as Record<string, unknown>;
      setResult(res);
      refetch();
    } catch {
      setError("Erreur lors de l'import IA. Vérifiez que le fichier est valide.");
    } finally { setImporting(false); }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-off-white">Import IA</h1>
        <Link href="/dashboard/edt" className="text-sm text-muted hover:text-off-white font-mono transition-colors">← Retour</Link>
      </div>

      <form onSubmit={handleImport} className="bg-[#111] p-6 rounded border border-[#222] space-y-4">
        <p className="text-sm text-muted">
          Importez une image d'emploi du temps. L'IA (PaliGemma) extraira automatiquement les événements.
        </p>

        <div>
          <label htmlFor="edt-select" className="block text-sm font-medium text-off-white mb-1">Emploi du temps cible</label>
          <select id="edt-select" value={edtId} onChange={(e) => setEdtId(e.target.value)} required
            className="w-full border border-[#333] rounded px-3 py-2 bg-[#111] text-off-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-acid/50">
            <option value="">Sélectionner...</option>
            {edts.map((edt) => (
              <option key={edt.id} value={edt.id}>{edt.titre} ({edt.type})</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="file-upload" className="block text-sm font-medium text-off-white mb-1">Image (JPG, PNG, PDF)</label>
          <input id="file-upload" type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} required
            className="w-full text-sm text-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#222] file:text-off-white file:text-xs file:font-mono hover:file:bg-[#333]" />
          {preview && <img src={preview} alt="Aperçu" className="mt-2 max-h-48 rounded object-contain border border-[#222]" />}
        </div>

        {error && <p className="text-red-400 text-sm" role="alert">{error}</p>}

        <button type="submit" disabled={importing || !file || !edtId}
          className="bg-acid text-black px-6 py-2 rounded hover:bg-acid/90 disabled:opacity-50 font-mono text-xs uppercase tracking-widest transition-colors">
          {importing ? 'Analyse en cours (IA)...' : 'Importer avec l\'IA'}
        </button>
      </form>

      {result && (
        <div className="bg-[#111] p-6 rounded border border-[#222] mt-6 space-y-4">
          <h2 className="text-lg font-semibold text-off-white">Résultat de l'analyse</h2>
          <p className="text-xs text-muted font-mono">
            Modèle : {String(result.modele_utilise || 'PaliGemma')} — Confiance : {result.confiance ? `${(Number(result.confiance) * 100).toFixed(0)}%` : 'N/A'}
          </p>

          {Array.isArray(result.resultat_json) && result.resultat_json.length > 0 ? (
            <div className="space-y-2">
              {(result.resultat_json as Array<Record<string, string>> || []).map((evt, i: number) => (
                <div key={i} className="bg-[#0A0A0A] p-3 rounded border border-[#222] text-sm">
                  <p className="text-off-white font-semibold">{evt.titre || evt.matiere || 'Événement'}</p>
                  <p className="text-muted">
                    {evt.date_debut ? new Date(evt.date_debut).toLocaleString('fr-FR') : ''}
                    {evt.date_fin ? ` → ${new Date(evt.date_fin).toLocaleString('fr-FR')}` : ''}
                    {evt.lieu ? ` — ${evt.lieu}` : ''}
                  </p>
                  {evt.type && <span className="text-xs text-acid font-mono">{evt.type}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">Aucun événement extrait. Le fichier est peut-être illisible.</p>
          )}

          <Link href={`/dashboard/edt`}
            className="inline-block bg-[#222] text-off-white px-4 py-2 rounded hover:bg-[#333] font-mono text-xs uppercase tracking-widest transition-colors">
            Voir l'emploi du temps
          </Link>
        </div>
      )}

      {conversions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-off-white mb-3">Imports récents</h2>
          <div className="space-y-2">
            {conversions.slice(0, 5).map((c) => (
              <div key={c.id} className="bg-[#111] p-3 rounded border border-[#222] flex items-center justify-between text-sm">
                <div>
                  <p className="text-off-white">{c.titre}</p>
                  <p className="text-xs text-muted">{new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-mono bg-[#222] text-muted`}>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
