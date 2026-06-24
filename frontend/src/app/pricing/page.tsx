import { fetchFromStrapi } from "@/lib/strapi";
import { RenderingIndicator } from "@/components/RenderingIndicator";
import { Check } from "lucide-react";

export const revalidate = false;

interface PricingPlan {
  name: string;
  price: string;
  billing: string;
  features: string[];
}

export default async function PricingPage() {
  const plans = await fetchFromStrapi<PricingPlan[]>("pricing-plans", "pricing");

  return (
    <div className="space-y-8 py-8">
      <RenderingIndicator type="SSG" source="CMS" />

      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Simple, Predictable Tier Pricing</h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm">
          No hidden fees. Scale up instantly with our zero-friction tier structures as database
          processing grows.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-8">
        {plans.map((p, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-lg flex flex-col justify-between ${
              idx === 1
                ? "bg-slate-900/80 border-2 border-emerald-500/80 relative shadow-lg"
                : "bg-slate-900/40 border border-slate-800"
            }`}
          >
            {idx === 1 && (
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </span>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-200">{p.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-slate-100">{p.price}</span>
                <span className="text-xs text-slate-400 font-medium">/ {p.billing}</span>
              </div>
              <ul className="space-y-3 pt-4 border-t border-slate-800">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <button
                className={`w-full py-2 rounded font-semibold text-xs transition duration-300 ${
                  idx === 1
                    ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    : "bg-slate-800 text-slate-100 hover:bg-slate-700"
                }`}
              >
                Choose {p.name} Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
