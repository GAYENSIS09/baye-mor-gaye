import Link from 'next/link';

export default function DashboardNotFound() {
  return (
    <div className="flex-1 bg-off-black flex items-center justify-center px-6 py-16">
      <div className="text-center max-w-md">
        <p className="font-mono text-sm text-acid uppercase tracking-widest mb-4">404</p>
        <h2 className="font-display text-4xl text-white mb-4">Section introuvable</h2>
        <p className="text-muted text-sm mb-8">Cette section du tableau de bord n'existe pas.</p>
        <Link
          href="/dashboard"
          className="bg-acid text-black px-6 py-3 font-mono text-sm uppercase tracking-widest hover:bg-acid/90 transition-colors rounded"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
