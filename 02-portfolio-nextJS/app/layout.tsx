import type { Metadata } from "next";
import "@/app/globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/lib/query-client";
import { DebugProvider } from "@/lib/debug";
import { Bebas_Neue, DM_Sans, JetBrains_Mono } from 'next/font/google';
import { PersonJsonLd, WebSiteJsonLd } from '@/components/JsonLd';
import Navbar from '@/components/Navbar';

const fontDisplay = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
});

const fontBody = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const STORAGE_URL = API_BASE.replace('/api', '/storage');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'https://bayemor.ga';

interface ProfileData {
  nom: string;
  titre_professionnel: string | null;
  bio: string | null;
  photo: string | null;
  site_web: string | null;
}

async function fetchProfile(): Promise<ProfileData | null> {
  try {
    const res = await fetch(`${API_BASE}/profile/public`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const raw = await res.json();
    return raw?.data ?? raw;
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const profile = await fetchProfile();
  if (!profile) return { title: '', description: '' };

  const title = `${profile.nom} — ${profile.titre_professionnel}`;
  const description = profile.bio ?? '';
  const photoUrl = profile.photo ? `${STORAGE_URL}/${profile.photo}` : null;
  const url = profile.site_web ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      ...(photoUrl && { images: [{ url: photoUrl, width: 400, height: 400, alt: profile.nom }] }),
    },
    twitter: {
      card: "summary",
      title,
      description,
      ...(photoUrl && { images: [photoUrl] }),
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await fetchProfile();
  const photoUrl = profile?.photo ? `${STORAGE_URL}/${profile.photo}` : null;

  return (
    <html lang="fr" className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`} style={{ colorScheme: 'dark' }}>
      <head>
        <meta name="theme-color" content="#0A0A0A" />

        {profile && (
          <>
            <PersonJsonLd
              name={profile.nom}
              jobTitle={profile.titre_professionnel}
              url={SITE_URL}
              image={photoUrl}
            />
            <WebSiteJsonLd
              name={`${profile.nom} — Portfolio`}
              url={SITE_URL}
              description={profile.bio ?? `Portfolio de ${profile.nom}`}
            />
          </>
        )}
      </head>
      <body>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:px-4 focus:py-2 focus:bg-acid focus:text-black focus:rounded focus:font-mono focus:text-sm">
          Aller au contenu
        </a>
        <DebugProvider><QueryProvider><AuthProvider>
          <Navbar />
          <div id="main-content" className="pt-14">{children}</div>
        </AuthProvider></QueryProvider></DebugProvider>
      </body>
    </html>
  );
}
