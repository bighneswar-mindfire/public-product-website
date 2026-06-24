import { Cpu, Database } from "lucide-react";

interface IndicatorProps {
  type: "SSG" | "ISR" | "SSR" | "CSR";
  source: "CMS" | "API";
}

export function RenderingIndicator({ type, source }: IndicatorProps) {
  return (
    <div className="bg-slate-900/80 border border-emerald-500/30 text-emerald-400 rounded-md p-3 text-xs flex flex-wrap gap-4 justify-between items-center max-w-7xl mx-auto my-4 shadow-md px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <Cpu size={14} className="animate-pulse" />
        <span>
          <strong>Rendering Type:</strong> {type}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Database size={14} />
        <span>
          <strong>Data Source:</strong> {source}
        </span>
      </div>
    </div>
  );
}
