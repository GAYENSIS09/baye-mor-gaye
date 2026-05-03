"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

const links = [
  { label: "Profil",       href: "/#about" },
  { label: "Projets",      href: "/projets" },
  { label: "Publications", href: "/publications" },
  { label: "Ressources",   href: "/ressources" },
  { label: "Contact",      href: "/contact" },
];

export default function FloatingPillNav() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");
  const lastScroll = useRef(0);
  const frame = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastScroll.current;
        if (y > 80) {
          setVisible(true);
          if (Math.abs(delta) > 5) {
            setScrollDir(delta > 0 ? "down" : "up");
          }
        } else {
          setVisible(false);
        }
        lastScroll.current = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/#about") return pathname === "/";
    return pathname.startsWith(href);
  };

  const translateY = visible
    ? scrollDir === "down"
      ? "translateY(-120%)"
      : "translateY(0)"
    : "translateY(-120%)";

  return (
    <>
      <nav
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden md:block transition-all duration-300"
        style={{ transform: `translateX(-50%) ${translateY}` }}
        aria-label="Navigation principale"
      >
        <ul className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#333] bg-[#0A0A0A]/80 backdrop-blur-md" role="list">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <li key={l.href} role="listitem">
                <Link
                  href={l.href}
                  className={`px-3 py-1.5 text-xs font-mono tracking-wider rounded-full transition-all ${
                    active
                      ? "text-acid bg-acid/10"
                      : "text-muted hover:text-off-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
          <li className="ml-2 pl-2 border-l border-[#333]" role="listitem">
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-mono text-muted hover:text-off-white transition-colors"
            >
              Se connecter
            </Link>
          </li>
        </ul>
      </nav>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-[#222] bg-[#0A0A0A]/95 backdrop-blur-md"
        style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}
        aria-label="Navigation mobile"
      >
        <ul className="flex items-center justify-around py-2" role="list">
          {links.map((l) => {
            const active = isActive(l.href);
            return (
              <li key={l.href} role="listitem">
                <Link
                  href={l.href}
                  className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-mono tracking-wider transition-colors ${
                    active ? "text-acid" : "text-muted"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
