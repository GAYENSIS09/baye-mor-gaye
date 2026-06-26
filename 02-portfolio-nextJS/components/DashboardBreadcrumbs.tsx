'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const labels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/profil': 'Profil',
  '/dashboard/experiences': 'Expériences',
  '/dashboard/formations': 'Formations',
  '/dashboard/certifications': 'Certifications',
  '/dashboard/competences': 'Compétences',
  '/dashboard/domaines': 'Domaines',
  '/dashboard/publications': 'Publications',
  '/dashboard/publications/new': 'Nouvelle publication',
  '/dashboard/projets': 'Projets',
  '/dashboard/projets/new': 'Nouveau projet',
  '/dashboard/ressources': 'Ressources',
  '/dashboard/edt': 'Emploi du temps',
  '/dashboard/edt/importer': 'Importer',
  '/dashboard/rappels': 'Rappels',
  '/dashboard/commentaires': 'Commentaires',
  '/dashboard/messages': 'Messages',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/statistiques': 'Statistiques',
};

const subLabels: Record<string, (id: string) => string> = {
  '/dashboard/publications/[id]/edit': () => 'Modifier',
  '/dashboard/projets/[id]/edit': () => 'Modifier',
};

export default function DashboardBreadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length <= 1) return null;

  const crumbs: { label: string; href: string }[] = [];
  let accumulated = '';

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    accumulated += '/' + seg;
    const label = labels[accumulated];
    if (label) {
      crumbs.push({ label, href: accumulated });
    } else if (i === segments.length - 1) {
      const isEdit = accumulated.endsWith('/edit');
      const isNew = accumulated.endsWith('/new');
      const parent = accumulated.replace(/\/new$|\/edit$/, '').replace(/\/[^/]+\/[^/]+$/, '');
      if (isEdit) crumbs.push({ label: 'Modifier', href: accumulated });
      else if (isNew) crumbs.push({ label: 'Nouveau', href: accumulated });
      else crumbs.push({ label: 'Détail', href: accumulated });
    }
  }

  return (
    <nav aria-label="Fil d'Ariane" className="mb-4 w-full max-w-full overflow-hidden">
      <ol className="flex items-center gap-1.5 text-xs font-mono text-muted flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
        {crumbs.map((crumb, i) => (
          <li key={crumb.href} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem" className="flex items-center gap-1.5">
            {i > 0 && (
              <svg className="w-3 h-3 text-muted/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {i < crumbs.length - 1 ? (
              <Link href={crumb.href} className="hover:text-off-white transition-colors" itemProp="item">
                <span itemProp="name">{crumb.label}</span>
              </Link>
            ) : (
              <span className="text-off-white" itemProp="name" aria-current="page">{crumb.label}</span>
            )}
            <meta itemProp="position" content={String(i + 1)} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
