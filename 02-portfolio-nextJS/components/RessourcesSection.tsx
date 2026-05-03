"use client";
import { useRessources } from "@/hooks/queries";
import DomaineBadge from "@/components/DomaineBadge";
import { Icons } from '@/components/ui/Icons';

function TypeIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    document: <Icons.file className="w-5 h-5 text-muted" aria-hidden />,
    image: <Icons.file className="w-5 h-5 text-muted" aria-hidden />,
    archive: <Icons.folder className="w-5 h-5 text-muted" aria-hidden />,
    lien: <Icons.external className="w-5 h-5 text-muted" aria-hidden />,
    video: <Icons.play className="w-5 h-5 text-muted" aria-hidden />,
    audio: <Icons.bell className="w-5 h-5 text-muted" aria-hidden />,
  };
  return <span className="text-lg" aria-hidden="true">{icons[type.toLowerCase()] || <Icons.file className="w-5 h-5 text-muted" aria-hidden />}</span>;
}

export default function RessourcesSection() {
  const { data, isLoading } = useRessources({ publique: '1' });
  const ressources = data?.data ?? [];

  return (
    <section id="ressources" className="py-32 px-6 bg-off-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-baseline gap-6 mb-16">
          <span className="font-mono text-acid text-xs uppercase tracking-widest">06</span>
          <h2 className="font-display text-5xl md:text-7xl text-white uppercase tracking-tight">Ressources</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <span className="font-mono text-sm text-muted animate-pulse">Chargement...</span>
          </div>
        ) : ressources.length === 0 ? (
          <div className="text-center py-16">
            <span className="font-mono text-sm text-muted">Aucune ressource disponible.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ressources.map((r) => (
              <div key={r.id} className="bg-[#111] border border-[#222] rounded-lg p-5 hover:border-acid/40 transition-colors">
                <div className="flex items-start gap-4">
                  <TypeIcon type={r.type} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-off-white font-semibold text-sm truncate">{r.titre}</h3>
                    {r.domaine && <DomaineBadge nom={r.domaine.nom} couleur={r.domaine.couleur} />}
                  </div>
                </div>
                {r.fichier && (
                  <a href={r.fichier} target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-xs text-acid hover:underline font-mono">
                    Télécharger ↓
                  </a>
                )}
                {r.url_externe && (
                  <a href={r.url_externe} target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-xs text-acid hover:underline font-mono">
                    Accéder ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
