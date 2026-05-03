"use client";

import { useProfile } from "@/hooks/useProfile";

export default function Footer() {
  const { profile } = useProfile();

  return (
    <footer className="border-t border-[#222] px-6 py-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="font-mono text-xs text-muted">
          &copy; {new Date().getFullYear()} {profile?.nom || "Baye Mor Gaye"}
        </p>

        <p className="font-mono text-xs text-muted text-center">
          Built with Next.js &middot; {profile?.localisation || ""}
        </p>

        <div className="flex items-center gap-4 font-mono text-xs">
          {profile?.url_linkedin && (
            <a
              href={profile.url_linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-acid transition-colors"
            >
              LinkedIn
            </a>
          )}
          {profile?.email && (
            <a
              href={`mailto:${profile.email}`}
              className="text-muted hover:text-acid transition-colors"
            >
              Email
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
