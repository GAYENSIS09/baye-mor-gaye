"use client";
import { useState, useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import CompetenceBar from "@/components/CompetenceBar";
import { SectionHeader } from "@/components/SectionHeader";

export default function CompetencesSection() {
  const { profile, loading, error } = useProfile();
  const [filter, setFilter] = useState<string>('');
  const competences = profile?.competences ?? [];

  const categories = useMemo(() => {
    const cats = new Set<string>();
    competences.forEach((c) => cats.add(c.categorie || 'Autre'));
    return Array.from(cats).sort();
  }, [competences]);

  const grouped = useMemo(() => {
    const groups = competences.reduce<{ categorie: string; skills: typeof competences }[]>((acc, comp) => {
      const cat = comp.categorie || 'Autre';
      if (filter && cat !== filter) return acc;
      let group = acc.find((g) => g.categorie === cat);
      if (!group) {
        group = { categorie: cat, skills: [] };
        acc.push(group);
      }
      group.skills.push(comp);
      return acc;
    }, []);
    return groups.sort((a, b) => categories.indexOf(a.categorie) - categories.indexOf(b.categorie));
  }, [competences, filter, categories]);

  return (
    <section id="skills" className="py-32 px-6 bg-off-black">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          number="03"
          title="Compétences"
          filters={[
            { value: '', label: 'Toutes' },
            ...categories.map((cat) => ({ value: cat, label: cat })),
          ]}
          activeFilter={filter}
          onFilterChange={(value) => setFilter(value)}
          filterVariant="tabs"
        />

        {loading ? (
          <div className="text-center py-16">
            <span className="font-mono text-sm text-muted animate-pulse">Chargement des compétences...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <span className="font-mono text-sm text-muted">Impossible de charger les compétences.</span>
          </div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-16">
            <span className="font-mono text-sm text-muted">Aucune compétence à afficher.</span>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => (
              <div key={group.categorie}>
                <h3 className="font-mono text-xs text-acid uppercase tracking-widest mb-4">{group.categorie}</h3>
                <div className="bg-[#111] border border-[#222] rounded-lg overflow-hidden">
                  {group.skills.map((skill) => {
                    const niveau = skill.niveaux?.[0]?.niveau || "debutant";
                    return (
                      <CompetenceBar
                        key={skill.id}
                        name={skill.nom}
                        niveau={niveau}
                        surligne={skill.niveaux?.[0]?.est_surligne}
                        icone={skill.icone}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
