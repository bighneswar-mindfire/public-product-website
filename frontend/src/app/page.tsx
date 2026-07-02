import { fetchFromStrapi } from "@/lib/strapi";
import { RenderingIndicator } from "@/components/RenderingIndicator";
import { LiveStats } from "@/components/LiveStats";
import { NewsletterForm } from "@/components/NewsletterForm";
import Link from "next/link";

export const revalidate = 3600;

interface LandingData {
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  useCases: Array<{ id: string; title: string; description: string }>;
}

export default async function LandingPage() {
  const cmsData = await fetchFromStrapi<LandingData>("landing-page?populate=*", "landingPage");

  return (
    <section className="space-y-16 py-12">
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent leading-tight">
          {cmsData.heroTitle}
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed">{cmsData.heroSubtitle}</p>
        <div>
          <Link
            href="/login"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-6 py-3 rounded-lg transition shadow-lg shadow-emerald-500/10 cursor-pointer"
          >
            {cmsData.ctaText}
          </Link>
        </div>
      </div>

      {/* Live Stats */}
      <div className="border-y border-slate-900/60 py-10 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-100">Live Subscribers</h2>
          <p className="text-slate-400 text-sm mt-1">Satisfied Clients</p>
        </div>
        <LiveStats />
      </div>

      <div className="max-w-4xl mx-auto space-y-8 pt-6">
        <h2 className="text-2xl font-bold text-center text-slate-100">Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cmsData.useCases.map((uc) => (
            <div
              key={uc.id}
              className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-lg backdrop-blur-sm"
            >
              <h3 className="text-lg font-semibold text-emerald-400 mb-2">{uc.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{uc.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="border-t border-slate-900/60 pt-12">
        <NewsletterForm />
      </div>

      <div className="flex justify-end pt-4">
        <RenderingIndicator type="ISR" source="CMS" />
      </div>
    </section>
  );
}
