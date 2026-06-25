'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-off-black flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-mono text-sm text-acid uppercase tracking-widest mb-4">Erreur</p>
        <h2 className="font-display text-4xl text-white mb-4">Une erreur est survenue</h2>
        <p className="text-muted text-sm mb-8">Quelque chose s'est mal passé. Réessaie ou reviens plus tard.</p>
        <button
          onClick={reset}
          className="bg-acid text-black px-6 py-3 font-mono text-sm uppercase tracking-widest hover:bg-acid/90 transition-colors rounded"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}
