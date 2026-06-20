import type { Metadata } from 'next';
import ProjetClient from './ProjetClient';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/projets/${params.slug}`);
    const raw = await res.json();
    const projet = raw?.data ?? raw;
    return {
      title: projet.titre ? `${projet.titre} — Portfolio` : 'Projet — Portfolio',
      description: projet.courte_description || projet.description?.slice(0, 160) || 'Projet',
      openGraph: {
        title: projet.titre,
        description: projet.courte_description,
      },
    };
  } catch {
    return { title: 'Projet — Portfolio' };
  }
}

export default function ProjetPage() {
  return <ProjetClient />;
}
