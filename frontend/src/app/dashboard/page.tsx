// frontend/src/app/dashboard/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RenderingIndicator } from "@/components/RenderingIndicator";
import { verifySessionToken } from "@/auth/jwt";
import { db } from "@/lib/db";
import { User, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

interface StatsData {
  totalUsers: number;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("firebase-session");

  if (!sessionCookie) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const session = await verifySessionToken(sessionCookie.value);

  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  let totalUsers = 0;
  try {
    const nextAuthUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${nextAuthUrl}/api/stats`, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as StatsData;
      totalUsers = data.totalUsers;
    } else {
      totalUsers = db.getSubscribers().length;
    }
  } catch {
    totalUsers = db.getSubscribers().length;
  }

  const subscribers = db.getSubscribers();

  return (
    <div className="relative space-y-8 pt-8 pb-16">
      <RenderingIndicator type="SSR" source="API" />

      <div className="border-b border-slate-900 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50">Operation Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1">Subscribers monitoring</p>
        </div>
        <div className="bg-slate-900/50 px-4 py-2 border border-slate-800 rounded-lg flex items-center gap-2">
          <User size={16} className="text-emerald-400" />
          <span className="text-xs font-mono font-medium text-slate-200">{session.email}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-lg col-span-1 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            Administrator Identity
          </h3>
          <p className="text-lg font-bold text-slate-200 mt-2">User Email</p>
          <p className="text-xs text-slate-500 font-mono mt-1">{session.email}</p>
        </div>

        {/* subscribers */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-lg col-span-2 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
              Subscribers
            </h3>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-bold">
              {totalUsers} total
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {subscribers.map((sub, index) => (
              <div
                key={index}
                className="flex items-center gap-2.5 p-2 bg-slate-950/60 border border-slate-800 rounded text-xs font-mono text-slate-300"
              >
                <Mail size={12} className="text-slate-500" />
                <span>{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
