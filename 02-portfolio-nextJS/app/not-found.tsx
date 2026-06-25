import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-off-black flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="font-mono text-sm text-acid uppercase tracking-widest mb-4">404</p>
        <h2 className="font-display text-4xl text-white mb-4">Page introuvable</h2>
        <p className="text-muted text-sm mb-8">La page que tu cherches n'existe pas ou a été déplacée.</p>
        <Link
          href="/"
          className="bg-acid text-black px-6 py-3 font-mono text-sm uppercase tracking-widest hover:bg-acid/90 transition-colors rounded"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
