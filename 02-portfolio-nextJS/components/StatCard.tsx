interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  urgent?: boolean;
}

export default function StatCard({ label, value, icon, urgent }: StatCardProps) {
  return (
    <div className={`bg-[#111] p-4 rounded border ${urgent ? 'border-red-900/50' : 'border-[#222]'}`}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted font-mono uppercase tracking-wider">{label}</p>
        {icon && <span className="text-muted" aria-hidden="true">{icon}</span>}
      </div>
      <p className={`text-2xl font-bold mt-1 ${urgent ? 'text-red-400' : 'text-off-white'}`}>{value}</p>
      {urgent && <p className="text-xs text-red-400/70 mt-1">Nécessite votre attention</p>}
    </div>
  );
}
