export default function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="w-full min-w-0 bg-[#111] rounded-lg border border-[#222] p-4 space-y-3 animate-pulse">
      <div className="h-40 bg-[#222] rounded" />
      <div className="h-4 bg-[#222] rounded w-3/4" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 bg-[#222] rounded" style={{ width: `${70 - i * 15}%` }} />
        ))}
      </div>
    </div>
  );
}
