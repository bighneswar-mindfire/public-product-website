"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { RenderingIndicator } from "./RenderingIndicator";

interface StatsData {
  totalUsers: number;
}

export function LiveStats() {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = (await res.json()) as StatsData;
          if (isMounted) {
            setStats(data);
          }
        }
      } catch (err) {
        console.error("Failed to read live stats:", err);
      }
    }

    fetchStats();

    const interval = setInterval(fetchStats, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto pb-6">
      <RenderingIndicator type="CSR" source="API" position="absolute" />
      <div className="bg-slate-900/40 border border-slate-800/85 p-6 rounded-lg flex items-center justify-center gap-5 backdrop-blur-sm shadow-lg">
        <div className="p-4 bg-emerald-500/10 rounded-md text-emerald-400">
          <Users size={28} />
        </div>
        <div>
          <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">
            Total Users
          </p>
          <p className="text-3xl font-extrabold text-slate-100 mt-1">
            {stats !== null ? stats.totalUsers : "..."}
          </p>
        </div>
      </div>
    </div>
  );
}
