'use client';

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex-1 bg-off-black flex items-center justify-center px-6 py-16">
      <div className="text-center max-w-md">
        <p className="font-mono text-sm text-acid uppercase tracking-widest mb-4">Erreur</p>
        <h2 className="font-display text-4xl text-white mb-4">Impossible de charger cette page</h2>
        <p className="text-muted text-sm mb-8">Un problème est survenu. Tu peux réessayer ou revenir au tableau de bord.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="bg-acid text-black px-6 py-3 font-mono text-sm uppercase tracking-widest hover:bg-acid/90 transition-colors rounded"
          >
            Réessayer
          </button>
          <a
            href="/dashboard"
            className="text-sm text-muted hover:text-off-white font-mono transition-colors"
          >
            Retour
          </a>
        </div>
      </div>
    </div>
  );
}
