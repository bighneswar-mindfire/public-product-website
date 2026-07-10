export default function Loading() {
  return (
    <div className="space-y-8 py-8 animate-pulse" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>

      <div className="space-y-4 text-center">
        <div className="h-9 w-64 mx-auto rounded bg-slate-800/60" />
        <div className="h-4 w-96 max-w-full mx-auto rounded bg-slate-800/40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-6 bg-slate-900/40 border border-slate-800 rounded-lg space-y-3">
            <div className="h-5 w-1/2 rounded bg-slate-800/60" />
            <div className="h-3 w-full rounded bg-slate-800/40" />
            <div className="h-3 w-5/6 rounded bg-slate-800/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
