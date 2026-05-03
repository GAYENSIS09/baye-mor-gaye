interface FilterBarProps {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
  label?: string;
}

export function FilterBar({ options, selected, onSelect, label }: FilterBarProps) {
  return (
    <nav className="flex gap-2 flex-wrap" aria-label={label || 'Filtres'}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`px-3 py-1.5 rounded font-mono text-xs uppercase tracking-widest transition-colors ${
            selected === opt.value
              ? 'bg-acid text-black'
              : 'bg-[#222] text-muted hover:text-off-white'
          }`}
          aria-pressed={selected === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </nav>
  );
}
