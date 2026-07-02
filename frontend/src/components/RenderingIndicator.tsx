interface IndicatorProps {
  type: "SSG" | "ISR" | "SSR" | "CSR";
  source: "CMS" | "API";
  position?: "fixed" | "absolute" | "static";
}

export function RenderingIndicator({ type, source, position = "static" }: IndicatorProps) {
  const positionClasses =
    position === "fixed"
      ? "fixed bottom-3 right-4 z-50"
      : position === "absolute"
        ? "absolute bottom-3 right-4 z-10"
        : "";

  return (
    <div
      className={`${positionClasses} text-[10px] font-mono text-slate-500 select-none pointer-events-none tracking-wide`}
    >
      Rendering type: {type} • Source: {source}
    </div>
  );
}
