export default function Loading() {
  return (
    <div className="min-h-screen bg-off-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-acid border-t-transparent rounded-full animate-spin" />
        <p className="font-mono text-sm text-muted animate-pulse">Chargement...</p>
      </div>
    </div>
  );
}
