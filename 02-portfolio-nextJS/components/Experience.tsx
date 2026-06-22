"use client";
import { useState } from "react";
import { useExperiences, useFormations, useCertifications } from "@/hooks/queries";
import { MiniMediaGallery } from "@/components/MediaGallery";
import type { GalleryItem } from "@/components/MediaGallery";
import type { Media, Certification } from "@/types/api";
import { getMediaUrl } from "@/lib/media";
import { CardContainer, CardContent, CardTitle, CardDescription, CardMeta, CardTags } from "@/components/CardContainer";
import { SectionHeader } from "@/components/SectionHeader";
import { Icons } from "@/components/ui/Icons";

function toGalleryItems(medias?: Media[]): GalleryItem[] {
  if (!medias) return [];
  return medias.filter((m) => m.chemin_fichier).map((m) => ({
    id: m.id,
    url: getMediaUrl(m.chemin_fichier) ?? m.chemin_fichier!,
    type: m.type,
    titre: m.titre,
  }));
}

type FilterValue = 'tout' | 'experience' | 'formation' | 'certification';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
}

function TimelineItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative grid md:grid-cols-[200px_1fr] gap-6 md:gap-12 py-10 border-t border-[#222] hover:border-acid/40 transition-colors duration-300">
      {children}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-acid scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />
    </div>
  );
}

function ExperienceCard({ item }: { item: { type: FilterValue; id: string; date: string; content: React.ReactNode } }) {
  return (
    <TimelineItem>
      <div className="self-start">
        <p className="font-mono text-xs text-muted uppercase tracking-widest">
          {formatDate(item.date)} – {item.type === 'experience' || item.type === 'formation' ? 'Présent' : ''}
        </p>
      </div>
      <div>{item.content}</div>
    </TimelineItem>
  );
}

export default function ExperienceTimeline() {
  const [filter, setFilter] = useState<FilterValue>('tout');
  const { data: experiences = [], isLoading: loadingExp } = useExperiences();
  const { data: formations = [], isLoading: loadingForm } = useFormations();
  const { data: certifications = [], isLoading: loadingCert } = useCertifications();
  const loading = loadingExp || loadingForm || loadingCert;

  const items: { type: FilterValue; id: string; date: string; content: React.ReactNode }[] = [
    ...experiences.map((exp) => ({
      type: 'experience' as FilterValue,
      id: `exp-${exp.id}`,
      date: exp.date_debut,
      content: (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-off-white text-xl font-body font-medium">{exp.titre}</h3>
              <p className="text-acid font-mono text-sm mt-1">{exp.entreprise}</p>
            </div>
            <span className="tag">Expérience</span>
          </div>
          {exp.description && <p className="text-muted text-sm leading-relaxed">{exp.description}</p>}
          {exp.medias && exp.medias.length > 0 && (
            <MiniMediaGallery items={toGalleryItems(exp.medias)} />
          )}
        </>
      ),
    })),
    ...formations.map((f) => ({
      type: 'formation' as FilterValue,
      id: `form-${f.id}`,
      date: f.date_debut,
      content: (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-off-white text-xl font-body font-medium">{f.diplome}</h3>
              <p className="text-acid font-mono text-sm mt-1">{f.etablissement}</p>
            </div>
            <span className="tag">Formation</span>
          </div>
          {f.domaine_etude && <p className="text-muted text-sm">{f.domaine_etude}</p>}
          {f.description && <p className="text-muted text-xs mt-2">{f.description}</p>}
          {f.medias && f.medias.length > 0 && (
            <MiniMediaGallery items={toGalleryItems(f.medias)} />
          )}
        </>
      ),
    })),
    ...certifications.map((c) => {
      const certGalleryItems = toGalleryItems(c.medias);
      const hasLocalCredential = c.url_credential && !c.url_credential.startsWith('http://') && !c.url_credential.startsWith('https://');
      if (hasLocalCredential) {
        certGalleryItems.push({
          id: -(c.id),
          url: getMediaUrl(c.url_credential!) ?? c.url_credential!,
          type: 'pdf',
          titre: `${c.titre} - Certificat`,
        });
      }
      return {
        type: 'certification' as FilterValue,
        id: `cert-${c.id}`,
        date: c.date_obtention,
        content: (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-off-white text-xl font-body font-medium">{c.titre}</h3>
                <p className="text-acid font-mono text-sm mt-1">{c.organisme}</p>
              </div>
              <span className="tag">Certification</span>
            </div>
            {c.description && <p className="text-muted text-sm">{c.description}</p>}
            {c.date_expiration && (
              <p className="text-xs text-muted mt-1">Expire le {formatDate(c.date_expiration)}</p>
            )}
            {c.url_credential && c.url_credential.startsWith('http') && (
              <a href={c.url_credential} target="_blank" rel="noopener noreferrer"
                className="inline-block mt-2 text-xs text-acid hover:underline font-mono">
                Voir le certificat ↗
              </a>
            )}
            {certGalleryItems.length > 0 && (
              <MiniMediaGallery items={certGalleryItems} />
            )}
          </>
        ),
      };
    }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = filter === 'tout' ? items : items.filter((i) => i.type === filter);

  return (
    <section id="experience" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          number="02"
          title="Parcours"
          filters={[
            { value: 'tout', label: 'Tout' },
            { value: 'experience', label: 'Expériences' },
            { value: 'formation', label: 'Formations' },
            { value: 'certification', label: 'Certifications' },
          ]}
          activeFilter={filter}
          onFilterChange={(value) => setFilter(value as FilterValue)}
        />
        {loading ? (
          <div className="text-center py-16">
            <span className="font-mono text-sm text-muted animate-pulse">Chargement...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="font-mono text-sm text-muted">Aucun élément à afficher.</span>
          </div>
        ) : (
          <div className="space-y-0">
            {filtered.map((item) => (
              <ExperienceCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}