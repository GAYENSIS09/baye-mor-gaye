"use client";
import { useState, useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import CompetenceBar from "@/components/CompetenceBar";

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
        <div className="flex items-baseline gap-6 mb-8">
          <span className="font-mono text-acid text-xs uppercase tracking-widest">03</span>
          <h2 className="font-display text-5xl md:text-7xl text-white uppercase tracking-tight">Compétences</h2>
        </div>

        {categories.length > 1 && (
          <div className="flex gap-2 mb-12 flex-wrap">
            <button onClick={() => setFilter('')}
              className={`px-3 py-1.5 rounded font-mono text-xs uppercase tracking-widest transition-colors ${
                !filter ? 'bg-acid text-black' : 'bg-[#222] text-muted hover:text-off-white'
              }`}>
              Toutes
            </button>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded font-mono text-xs uppercase tracking-widest transition-colors ${
                  filter === cat ? 'bg-acid text-black' : 'bg-[#222] text-muted hover:text-off-white'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        )}

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
