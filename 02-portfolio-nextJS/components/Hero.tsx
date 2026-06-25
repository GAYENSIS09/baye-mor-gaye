"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { useProfile } from "@/hooks/useProfile";
import { getMediaUrl } from "@/lib/media";

function ProprietaireAvatar({ photo, nom }: { photo: string | null; nom: string }) {
  if (!photo) return null;
  return (
    <Image
      src={photo}
      alt={nom || "Photo de profil"}
      width={144}
      height={144}
      priority
      className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-2 border-acid/30"
    />
  );
}

function ProprietaireTitre({ prenom, nom }: { prenom: string; nom: string }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;
    const handler = () => {
      if (titleRef.current) {
        titleRef.current.style.transform = `translateY(${window.scrollY * 0.15}px)`;
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <h1
      ref={titleRef}
      className="font-display text-[12vw] md:text-[8vw] lg:text-[7rem] leading-[0.85]
                 text-white uppercase tracking-tight will-change-transform"
      style={{ animationDelay: "0.1s" }}
    >
      {prenom}
      <br />
      <span className="text-off-white">{nom}</span>
    </h1>
  );
}

function ProprietaireBio({ bio }: { bio: string }) {
  return (
    <p className="text-muted text-lg md:text-xl max-w-md leading-relaxed">{bio}</p>
  );
}

function ProprietaireLinks({ linkedin, github, siteweb }: { linkedin?: string | null; github?: string | null; siteweb?: string | null }) {
  return (
    <div className="flex gap-3">
      {linkedin && (
        <a href={linkedin} target="_blank" rel="noopener noreferrer"
          className="px-6 py-3 bg-acid text-black text-sm font-mono uppercase tracking-widest rounded-full hover:bg-acid-dim transition-colors">
          LinkedIn →
        </a>
      )}
      {github && (
        <a href={github} target="_blank" rel="noopener noreferrer"
          className="px-6 py-3 border border-[#333] text-off-white text-sm font-mono uppercase tracking-widest rounded-full hover:border-acid hover:text-acid transition-all">
          GitHub
        </a>
      )}
      {siteweb && (
        <a href={siteweb} target="_blank" rel="noopener noreferrer"
          className="px-6 py-3 border border-[#333] text-off-white text-sm font-mono uppercase tracking-widest rounded-full hover:border-acid hover:text-acid transition-all">
          Site
        </a>
      )}
    </div>
  );
}

function ProprietaireLocalisation({ localisation }: { localisation?: string | null }) {
  if (!localisation) return null;
  return <span className="font-mono text-xs text-muted">{localisation}</span>;
}

function HeroCTA() {
  return (
    <a href="#experience"
      className="px-6 py-3 border border-[#333] text-off-white text-sm font-mono uppercase tracking-widest rounded-full hover:border-acid hover:text-acid transition-all">
      Voir mon parcours
    </a>
  );
}

export default function Hero() {
  const { profile, loading, error } = useProfile();

  const nomParts = profile?.nom?.split(" ") ?? [];
  const prenom = nomParts.slice(0, -1).join(" ");
  const nom = nomParts[nomParts.length - 1] ?? "";
  const titre = profile?.titre_professionnel ?? "";
  const localisation = profile?.localisation ?? "";
  const bio = profile?.bio ?? "";
  const photo = profile?.photo;

  return (
    <section className="relative min-h-screen flex flex-col justify-end pb-20 px-6 overflow-hidden">
      <div aria-hidden className="absolute top-1/4 right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-acid/5 blur-[80px] md:blur-[120px] pointer-events-none" />
      <div aria-hidden className="absolute bottom-0 left-[-5%] w-[200px] md:w-[300px] h-[200px] md:h-[300px] rounded-full bg-acid/3 blur-[60px] md:blur-[80px] pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="animate-pulse space-y-8">
            <div className="flex items-center gap-8 mb-8">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-[#222]" />
              <div className="space-y-4">
                <div className="h-16 w-64 bg-[#222] rounded" />
                <div className="h-12 w-48 bg-[#222] rounded" />
              </div>
            </div>
            <div className="h-6 w-96 bg-[#222] rounded" />
            <div className="flex gap-4">
              <div className="h-12 w-40 bg-[#222] rounded-full" />
              <div className="h-12 w-32 bg-[#222] rounded-full" />
            </div>
          </div>
        ) : error || !profile ? (
          <div className="h-48 flex items-center justify-center">
            <p className="text-muted font-mono text-sm">Impossible de charger le profil.</p>
          </div>
        ) : (
          <>
            <div className="absolute top-24 right-6 md:right-12 flex flex-col items-end gap-2 animate-fade-in">
              <span className="tag">{titre}</span>
              <ProprietaireLocalisation localisation={localisation} />
              <span className="font-mono text-xs text-muted">
                {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : ""}
              </span>
            </div>

            <div className="flex flex-row items-center gap-4 md:gap-8 mb-8">
              <div className="shrink-0">
                <ProprietaireAvatar photo={getMediaUrl(photo)} nom={profile?.nom || ""} />
              </div>
              <div className="min-w-0">
                <ProprietaireTitre prenom={prenom} nom={nom} />
              </div>
            </div>

            <div className="mt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6 animate-fade-up" style={{ animationDelay: "0.4s", opacity: 0 }}>
              <ProprietaireBio bio={bio || ''} />
              <div className="flex gap-4 flex-wrap">
                <HeroCTA />
                <ProprietaireLinks linkedin={profile?.url_linkedin} github={profile?.url_github} siteweb={profile?.site_web} />
              </div>
            </div>
          </>
        )}

        <div className="mt-12 flex items-center gap-4">
          <div className="h-px bg-[#333] flex-1" />
          <span className="font-mono text-xs text-muted animate-pulse-slow">↓ scroll</span>
        </div>
      </div>
    </section>
  );
}
