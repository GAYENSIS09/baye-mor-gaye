'use client';
import { useEffect, useRef, useState } from 'react';
import MediaViewer from '@/components/MediaViewer';

interface CompetenceBarProps {
  name: string;
  niveau: string;
  surligne?: boolean;
  icone?: string | null;
}

const NIVEAU_ORDER: Record<string, number> = {
  debutant: 1,
  intermediaire: 2,
  avance: 3,
  expert: 4,
};

function IconDisplay({ icone }: { icone?: string | null }) {
  if (!icone) return null;
  if (icone.startsWith('http://') || icone.startsWith('https://') || icone.startsWith('/')) {
    return <MediaViewer src={icone} alt="" width={20} height={20} className="shrink-0" />;
  }
  return <span className="text-base shrink-0">{icone}</span>;
}

export default function CompetenceBar({ name, niveau, surligne, icone }: CompetenceBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const safeName = name ?? '';
  const safeNiveau = niveau?.toLowerCase?.() ?? 'debutant';
  const level = NIVEAU_ORDER[safeNiveau] || 1;
  const pct = (level / 4) * 100;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`group flex items-center gap-4 py-2 px-3 rounded hover:bg-[#1a1a1a] transition-colors ${surligne ? 'bg-acid/5' : ''}`}>
      <IconDisplay icone={icone} />
      <span className="text-sm text-off-white min-w-0 sm:min-w-[120px] font-mono truncate">{safeName}</span>
      <div className="flex-1 h-2 bg-[#222] rounded-full overflow-hidden">
        <div
          className="h-full bg-acid rounded-full transition-all duration-1000 ease-out"
          style={{ width: visible ? `${pct}%` : '0%' }}
        />
      </div>
      <span className="text-xs text-muted font-mono min-w-[20px] text-right">{level}/4</span>
    </div>
  );
}
