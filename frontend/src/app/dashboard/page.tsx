import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RenderingIndicator } from "@/components/RenderingIndicator";
import { verifySessionToken } from "@/auth/jwt";
import { db } from "@/lib/db";
import { fetchFromStrapi } from "@/lib/strapi";
import { User, Mail, Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

interface StatsData {
  totalUsers: number;
}

interface BlogPost {
  slug: string;
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

  let totalSubscribers = 0;
  try {
    const nextAuthUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${nextAuthUrl}/api/stats`, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as StatsData;
      totalSubscribers = data.totalUsers;
    } else {
      totalSubscribers = (await db.getSubscribers()).length;
    }
  } catch {
    totalSubscribers = (await db.getSubscribers()).length;
  }

  const blogPosts = await fetchFromStrapi<BlogPost[]>("blog-posts", "blogPosts");
  const totalBlogPosts = blogPosts.length;

  return (
    <div className="relative space-y-8 pt-8 pb-16">
      <RenderingIndicator type="SSR" source="API" />

      <div className="border-b border-slate-900 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-50">Operation Dashboard</h1>
          <p className="text-slate-400 text-xs mt-1">Content & subscribers overview</p>
        </div>
        <div className="bg-slate-900/50 px-4 py-2 border border-slate-800 rounded-lg flex items-center gap-2">
          <User size={16} className="text-emerald-400" />
          <span className="text-xs font-mono font-medium text-slate-200">
            {session.name ? `${session.name} · ${session.email}` : session.email}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-lg col-span-1 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
            User Details
          </h3>
          <p className="text-lg font-bold text-slate-200 mt-2">{session.name || "User"}</p>
          <p className="text-xs text-slate-500 font-mono mt-1">{session.email}</p>
        </div>

        {/* counts */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-lg shadow-lg flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-md text-emerald-400">
              <Mail size={22} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                Newsletter Subscribers
              </h3>
              <p className="text-3xl font-extrabold text-slate-100 mt-1">{totalSubscribers}</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-lg shadow-lg flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-md text-emerald-400">
              <Newspaper size={22} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">
                Blog Posts
              </h3>
              <p className="text-3xl font-extrabold text-slate-100 mt-1">{totalBlogPosts}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
