'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef, useMemo, useId } from 'react';
import { Icons, NavIcon } from '@/components/ui/Icons';

const navGroups = [
  {
    label: 'Aperçu',
    links: [
      { label: 'Dashboard', href: '/dashboard', icon: 'grid' },
    ],
  },
  {
    label: 'Mon parcours',
    links: [
      { label: 'Profil', href: '/dashboard/profil', icon: 'user' },
      { label: 'Expériences', href: '/dashboard/experiences', icon: 'briefcase' },
      { label: 'Formations', href: '/dashboard/formations', icon: 'academic' },
      { label: 'Certifications', href: '/dashboard/certifications', icon: 'badge' },
      { label: 'Compétences', href: '/dashboard/competences', icon: 'star' },
      { label: 'Domaines', href: '/dashboard/domaines', icon: 'tag' },
    ],
  },
  {
    label: 'Créations',
    links: [
      { label: 'Publications', href: '/dashboard/publications', icon: 'file' },
      { label: 'Projets', href: '/dashboard/projets', icon: 'folder' },
      { label: 'Ressources', href: '/dashboard/ressources', icon: 'document' },
    ],
  },
  {
    label: 'Organisation',
    links: [
      { label: 'Emploi du temps', href: '/dashboard/edt', icon: 'calendar' },
      { label: 'Rappels', href: '/dashboard/rappels', icon: 'alarm' },
    ],
  },
  {
    label: 'Interactions',
    links: [
      { label: 'Commentaires', href: '/dashboard/commentaires', icon: 'chat' },
      { label: 'Messages', href: '/dashboard/messages', icon: 'mail' },
      { label: 'Notifications', href: '/dashboard/notifications', icon: 'bell' },
    ],
  },
  {
    label: 'Analyses',
    links: [
      { label: 'Statistiques', href: '/dashboard/statistiques', icon: 'chart' },
    ],
  },
];


interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const { utilisateur, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bmg-dashboard-sidebar');
    if (saved === 'collapsed') setCollapsed(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('bmg-dashboard-sidebar', next ? 'collapsed' : 'expanded');
      return next;
    });
  }, []);

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return navGroups;
    const q = searchQuery.toLowerCase();
    return navGroups.map(group => ({
      ...group,
      links: group.links.filter(l => l.label.toLowerCase().includes(q))
    })).filter(g => g.links.length > 0);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (!collapsed) inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [collapsed]);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const isExpandedVisual = !collapsed || isHovering;
  const navRef = useRef<HTMLElement>(null);

  const handleNavKeyDown = useCallback((e: React.KeyboardEvent) => {
    const links = navRef.current?.querySelectorAll<HTMLAnchorElement>('a[href]');
    if (!links || links.length === 0) return;
    const currentIndex = Array.from(links).findIndex((el) => el === document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (currentIndex + 1) % links.length;
      links[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (currentIndex - 1 + links.length) % links.length;
      links[prev]?.focus();
    }
  }, []);

  return (
    <>
      {open && (
        <button
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-label="Fermer le menu"
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#0A0A0A] border-r border-[#222]
          flex flex-col overflow-y-auto transition-all duration-300 ease-out
          ${collapsed && !isHovering ? 'w-16' : 'w-64'}
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        onMouseEnter={() => collapsed && setIsHovering(true)}
        onMouseLeave={() => collapsed && setIsHovering(false)}
        aria-label="Navigation du tableau de bord"
      >
        {/* Header */}
        <div className={`flex items-center border-b border-[#222] ${isExpandedVisual ? 'p-4 justify-between' : 'p-3 justify-center'}`}>
          {isExpandedVisual ? (
            <>
              <Link href="/" className="font-mono text-sm tracking-widest text-acid uppercase">
                BMG<span className="text-muted">.</span>dev
              </Link>
              <button
                onClick={toggleCollapsed}
                className="text-muted hover:text-off-white p-1 rounded hover:bg-[#222] transition-colors"
                aria-label="Réduire la sidebar"
              >
                <Icons.chevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleCollapsed}
              className="text-muted hover:text-off-white p-1 rounded hover:bg-[#222] transition-colors mx-auto"
              aria-label="Développer la sidebar"
            >
              <Icons.chevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search */}
        {isExpandedVisual && (
          <div className="p-3">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher dans le menu..."
                className="w-full bg-[#1a1a1a] text-sm text-off-white placeholder-muted/40
                  border border-[#333] rounded px-3 py-1.5 font-mono text-xs
                  focus:outline-none focus:border-acid/50 focus:ring-1 focus:ring-acid/20 transition-all"
                aria-label="Rechercher dans le menu"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted/30 font-mono pointer-events-none">
                ⌘K
              </kbd>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-muted hover:text-off-white"
                  aria-label="Effacer la recherche"
                >
                  <Icons.close className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav ref={navRef} className="flex-1 p-2 space-y-5 overflow-y-auto scrollbar-thin" role="navigation" onKeyDown={handleNavKeyDown}>
          {filteredGroups.map(group => (
            <div key={group.label}>
              {isExpandedVisual && (
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted/40 px-2 mb-1.5">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5" role="list">
                {group.links.map(link => {
                  const active = isActive(link.href);
                  return (
                    <li key={link.href} role="listitem">
                      <Link
                        href={link.href}
                        onClick={() => { onClose(); setSearchQuery(''); }}
                        className={`group/link relative flex items-center gap-3 px-2 py-2 rounded-lg
                          transition-all duration-150 font-mono text-xs
                          ${active
                            ? 'text-acid bg-acid/5 border border-acid/10'
                            : 'text-muted hover:text-off-white hover:bg-[#222] border border-transparent'
                          }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span className="w-5 h-5 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                          <NavIcon icon={link.icon} />
                        </span>
                        {isExpandedVisual && (
                          <span className="truncate">{link.label}</span>
                        )}
                        {active && isExpandedVisual && (
                          <span className="ml-auto w-1 h-1 rounded-full bg-acid" />
                        )}
                        {collapsed && !isHovering && (
                          <span className="absolute left-full ml-2 px-2.5 py-1 bg-[#1a1a1a] border border-[#333]
                            rounded-md text-xs text-off-white whitespace-nowrap opacity-0 invisible
                            group-hover/link:opacity-100 group-hover/link:visible transition-all duration-150 z-50
                            font-mono shadow-lg pointer-events-none">
                            {link.label}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Search empty state */}
        {searchQuery && filteredGroups.length === 0 && isExpandedVisual && (
          <div className="px-4 py-8 text-center">
            <Icons.search className="w-8 h-8 mx-auto text-muted/30 mb-2" />
            <p className="text-xs text-muted font-mono">Aucun résultat pour "<span className="text-off-white">{searchQuery}</span>"</p>
          </div>
        )}

        {/* User & Logout */}
        <div className={`border-t border-[#222] mt-auto ${isExpandedVisual ? 'p-3' : 'p-2'}`}>
          <div className={`flex items-center gap-3 px-2 py-2 ${isExpandedVisual ? '' : 'justify-center'}`}>
            {utilisateur?.photo ? (
              <img src={utilisateur.photo} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-acid font-mono text-xs flex-shrink-0" aria-hidden="true">
                {utilisateur?.nom?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            {isExpandedVisual && (
              <div className="flex-1 min-w-0">
                <p className="text-xs text-off-white truncate font-body">{utilisateur?.nom}</p>
                <p className="text-[10px] text-muted truncate font-mono">{utilisateur?.email}</p>
              </div>
            )}
          </div>
          <div className={`mt-1 space-y-0.5 ${isExpandedVisual ? '' : 'flex flex-col items-center'}`}>
            {isExpandedVisual && (
              <Link href="/" target="_blank"
                className="group/link flex items-center gap-3 px-2 py-1.5 text-xs text-muted hover:text-acid hover:bg-[#222] rounded transition-colors font-mono relative">
                <span className="w-5 text-center" aria-hidden="true">
                  <Icons.external className="w-4 h-4 mx-auto" />
                </span>
                Voir le site public
              </Link>
            )}
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className={`group/link flex items-center gap-3 px-2 py-1.5 text-xs text-muted hover:text-red-400 hover:bg-[#222] rounded transition-colors font-mono relative ${isExpandedVisual ? 'w-full' : ''}`}
            >
              <span className="w-5 text-center" aria-hidden="true">
                <Icons.logout className="w-4 h-4 mx-auto" />
              </span>
              {isExpandedVisual && 'Déconnexion'}
              {collapsed && !isHovering && (
                <span className="absolute left-full ml-2 px-2.5 py-1 bg-[#1a1a1a] border border-[#333]
                  rounded-md text-xs text-red-400 whitespace-nowrap opacity-0 invisible
                  group-hover/link:opacity-100 group-hover/link:visible transition-all duration-150 z-50
                  font-mono shadow-lg pointer-events-none">
                  Déconnexion
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
