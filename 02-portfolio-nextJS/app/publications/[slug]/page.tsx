import type { Metadata } from 'next';
import PublicationClient from './PublicationClient';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/publications/${params.slug}`);
    const publication = await res.json();
    return {
      title: publication.titre ? `${publication.titre} — Portfolio` : 'Publication — Portfolio',
      description: publication.courte_description || publication.contenu?.slice(0, 160) || 'Publication',
      openGraph: {
        title: publication.titre,
        description: publication.courte_description,
      },
    };
  } catch {
    return { title: 'Publication — Portfolio' };
  }
}

export default function PublicationPage() {
  return <PublicationClient />;
}
