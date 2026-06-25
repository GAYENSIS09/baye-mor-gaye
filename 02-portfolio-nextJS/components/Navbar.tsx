"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/queries";


const links = [
  { label: "Profil",       href: "/#about" },
  { label: "Projets",      href: "/projets" },
  { label: "Publications", href: "/publications" },
  { label: "Ressources",   href: "/ressources" },
  { label: "Contact",      href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { utilisateur, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);
  
  // Always call useNotifications to keep hook count stable across auth transitions
  // Only enable the actual query when authenticated to avoid 401 polling noise
  const { data: notifData, isError } = useNotifications({ est_lue: 'false' }, !!utilisateur);
  const unreadCount = isError || !utilisateur ? 0 : (notifData?.total ?? 0);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleNavKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab' && mobileRef.current) {
        const focusable = mobileRef.current.querySelectorAll<HTMLElement>('a, button');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleNavKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleNavKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/#about") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#222] bg-[#0A0A0A]/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-mono text-sm tracking-widest text-acid uppercase">
          BMG<span className="text-muted">.</span>dev
        </Link>

        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`px-3 py-1.5 text-xs font-mono tracking-wider rounded-full transition-all ${
                    active ? "text-acid bg-acid/10" : "text-muted hover:text-off-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:flex items-center gap-2">
          {utilisateur ? (
            <>
              <Link href="/dashboard" className="relative px-3 py-1.5 text-xs font-mono text-acid bg-acid/10 rounded-full hover:bg-acid/20 transition-colors">
                Dashboard
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-red-500 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
              <button onClick={logout} className="px-3 py-1.5 text-xs font-mono text-muted hover:text-red-400 transition-colors">
                Déconnexion
              </button>
            </>
          ) : !loading && (
            <Link href="/login" className="px-3 py-1.5 text-xs font-mono text-muted hover:text-off-white transition-colors">
              Se connecter
            </Link>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-off-white" aria-label="Menu" aria-expanded={open}>
          <span className={`block w-5 h-px bg-current mb-1.5 transition-transform ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`block w-5 h-px bg-current transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-px bg-current mt-1.5 transition-transform ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </div>

      <div ref={mobileRef} className={`md:hidden border-t border-[#222] px-6 py-4 space-y-3 ${open ? 'block' : 'hidden'}`} aria-hidden={!open}>
        {links.map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
            className={`block font-mono text-sm tracking-wider ${isActive(l.href) ? 'text-acid' : 'text-muted hover:text-off-white'}`}>
            {l.label}
          </Link>
        ))}
        <div className="pt-3 border-t border-[#222]">
          {utilisateur ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="block text-acid font-mono text-sm mb-2">Dashboard</Link>
              <button onClick={() => { logout(); setOpen(false); }} className="block text-red-400 font-mono text-sm">Déconnexion</button>
            </>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="block text-muted hover:text-off-white font-mono text-sm">Se connecter</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
