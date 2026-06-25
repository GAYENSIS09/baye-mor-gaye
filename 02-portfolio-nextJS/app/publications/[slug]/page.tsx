import type { Metadata } from 'next';
import PublicationClient from './PublicationClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/publications/${slug}`);
    const raw = await res.json();
    const publication = raw?.data ?? raw;
    return {
      title: publication.titre ? `${publication.titre} — Portfolio` : 'Publication — Portfolio',
      description: publication.extrait || publication.contenu?.slice(0, 160) || 'Publication',
      openGraph: {
        title: publication.titre,
        description: publication.extrait,
      },
    };
  } catch {
    return { title: 'Publication — Portfolio' };
  }
}

export default function PublicationPage() {
  return <PublicationClient />;
}
