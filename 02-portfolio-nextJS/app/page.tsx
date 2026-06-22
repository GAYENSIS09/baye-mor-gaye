import dynamic from 'next/dynamic';
import Hero from "@/components/Hero";
import ExperienceTimeline from "@/components/Experience";
import CompetencesSection from "@/components/Skills";
import ProjetsFeaturedSection from "@/components/Projects";
import PublicationsRecentesSection from "@/components/PublicationsRecentes";
import RessourcesSection from "@/components/RessourcesSection";
import Footer from "@/components/Footer";

const Contact = dynamic(() => import('@/components/Contact'), {
  loading: () => <div className="py-32 px-6 bg-off-black text-center"><span className="font-mono text-sm text-muted animate-pulse">Chargement...</span></div>,
});

export default function Home() {
  return (
    <main>
      <Hero />
      <ExperienceTimeline />
      <CompetencesSection />
      <ProjetsFeaturedSection />
      <PublicationsRecentesSection />
      <RessourcesSection />
      <Contact />
      <Footer />
    </main>
  );
}
