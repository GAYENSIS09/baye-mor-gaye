interface StatusBadgeProps {
  status: string;
  label?: string;
}

const styles: Record<string, string> = {
  publie: 'bg-green-900/20 text-green-400',
  publiee: 'bg-green-900/20 text-green-400',
  true: 'bg-green-900/20 text-green-400',
  brouillon: 'bg-yellow-900/20 text-yellow-400',
  false: 'bg-yellow-900/20 text-yellow-400',
  en_attente: 'bg-blue-900/20 text-blue-400',
  approuve: 'bg-green-900/20 text-green-400',
  rejete: 'bg-red-900/20 text-red-400',
  actif: 'bg-green-900/20 text-green-400',
  inactif: 'bg-[#222] text-muted',
  lu: 'bg-[#222] text-muted',
  non_lu: 'bg-acid/10 text-acid',
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const key = status.toLowerCase();
  const style = styles[key] ?? 'bg-[#222] text-muted';
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-mono ${style}`}>
      {label ?? status}
    </span>
  );
}
