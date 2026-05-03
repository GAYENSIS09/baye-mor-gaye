export function LoadingScreen({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center" role="status">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-acid border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs text-muted">{message}</span>
      </div>
    </div>
  );
}
