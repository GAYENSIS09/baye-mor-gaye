import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon = '', title, message, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <span className="text-3xl mb-4 opacity-40" aria-hidden="true">{icon}</span>}
      <h3 className="text-lg font-semibold text-off-white mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-6">{message}</p>
      {actionLabel && (actionHref ? (
        <Link href={actionHref} className="bg-acid text-black px-4 py-2 rounded font-mono text-xs uppercase tracking-widest hover:bg-acid/90 transition-colors">
          {actionLabel}
        </Link>
      ) : onAction ? (
        <button onClick={onAction} className="bg-acid text-black px-4 py-2 rounded font-mono text-xs uppercase tracking-widest hover:bg-acid/90 transition-colors">
          {actionLabel}
        </button>
      ) : null)}
    </div>
  );
}
