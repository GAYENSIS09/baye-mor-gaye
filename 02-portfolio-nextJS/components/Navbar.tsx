"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/queries";

const publicLinks = [
  { label: "Profil",      href: "#about"      },
  { label: "Expérience",  href: "#experience" },
  { label: "Skills",      href: "#skills"     },
  { label: "Projets",     href: "#projects"   },
  { label: "Contact",     href: "#contact"    },
];

const authLinks = [
  { label: "Tableau de bord", href: "/dashboard" },
  { label: "Profil",          href: "/dashboard/profil" },
];

export default function Navbar() {
  const { utilisateur, loading, logout } = useAuth();
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScroll = useRef(0);
  const [open, setOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);
  const { data: notifData } = useNotifications({ est_lue: 'false' }, !!utilisateur);
  const unreadCount = notifData?.total ?? 0;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (y > 80) {
        const delta = y - lastScroll.current;
        if (Math.abs(delta) > 5) {
          setVisible(delta < 0);
        }
      } else {
        setVisible(true);
      }
      lastScroll.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-[#222] bg-[#0A0A0A]/90 backdrop-blur-sm" : "bg-transparent"
      } ${visible ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-mono text-sm tracking-widest text-acid uppercase">
          BMG<span className="text-muted">.</span>dev
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex gap-8">
          {(utilisateur ? authLinks : publicLinks).map((l) => (
            <li key={l.href} className="relative">
              <Link
                href={l.href}
                className="text-sm text-muted hover:text-off-white transition-colors link-acid"
              >
                {l.label}
              </Link>
              {l.href === '/dashboard' && unreadCount > 0 && (
                <span className="absolute -top-2 -right-4 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </li>
          ))}
          {utilisateur && (
            <li>
              <button
                onClick={() => logout()}
                className="text-sm text-muted hover:text-red-400 transition-colors"
              >
                Déconnexion
              </button>
            </li>
          )}
        </ul>

        {/* CTA */}
        {!utilisateur && !loading && (
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-muted hover:text-off-white transition-colors font-mono"
            >
              Se connecter
            </Link>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-acid text-black
                         font-mono text-xs uppercase tracking-widest rounded-full
                         hover:bg-acid-dim transition-colors"
            >
              Hire me →
            </a>
          </div>
        )}
        {utilisateur && (
          <Link
            href="/dashboard"
            className="relative hidden md:inline-flex items-center gap-2 px-4 py-2 bg-acid text-black
                       font-mono text-xs uppercase tracking-widest rounded-full
                       hover:bg-acid-dim transition-colors"
          >
            Dashboard →
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        )}

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-off-white"
          aria-label="Menu"
          aria-expanded={open}
        >
          <span className="block w-5 h-px bg-current mb-1.5 transition-transform" />
          <span className={`block w-5 h-px bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className="block w-5 h-px bg-current mt-1.5 transition-transform" />
        </button>
      </div>

        {/* Mobile menu */}
      <div ref={mobileRef} className={`md:hidden bg-off-black border-t border-[#222] px-6 py-6 space-y-4 ${open ? 'block' : 'hidden'}`} aria-hidden={!open}>
          {(utilisateur ? authLinks : publicLinks).map((l) => (
            <div key={l.href} className="relative inline-block">
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="block text-off-white text-lg font-display tracking-wider"
              >
                {l.label}
              </Link>
              {l.href === '/dashboard' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
          ))}
          {!utilisateur && !loading && (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block text-off-white text-lg font-display tracking-wider"
            >
              Se connecter
            </Link>
          )}
          {utilisateur && (
            <button
              onClick={() => { logout(); setOpen(false); }}
              className="block text-red-400 text-lg font-display tracking-wider"
            >
              Déconnexion
            </button>
          )}
        </div>
    </nav>
  );
}
