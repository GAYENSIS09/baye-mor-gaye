interface DomaineBadgeProps {
  nom: string;
  couleur?: string | null;
}

export default function DomaineBadge({ nom, couleur }: DomaineBadgeProps) {
  return (
    <span
      className="inline-block text-xs px-2 py-0.5 rounded font-mono"
      style={{
        backgroundColor: couleur ? `${couleur}20` : '#222',
        color: couleur ?? '#888',
        borderColor: couleur ?? 'transparent',
        borderWidth: '1px',
      }}
    >
      {nom}
    </span>
  );
}
