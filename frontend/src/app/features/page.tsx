import { fetchFromStrapi } from "@/lib/strapi";
import { RenderingIndicator } from "@/components/RenderingIndicator";

export const revalidate = 3600;

interface FeatureItem {
  id: string;
  title: string;
  description: string;
}

export default async function FeaturesPage() {
  const features = await fetchFromStrapi<FeatureItem[]>("features", "features");

  return (
    <div className="space-y-8 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Facilities we provide</h1>
        <p className="text-slate-400 max-w-xl mx-auto text-sm">
          We offer a diverse range of vehicles to cater to different logistics needs, ensuring
          efficient and reliable transportation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-8">
        {features.map((item) => (
          <div
            key={item.id}
            className="p-6 bg-slate-900/40 border border-slate-800 rounded-lg hover:border-emerald-500/20 transition duration-300"
          >
            <h3 className="text-xl font-semibold mb-3 text-emerald-400">{item.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end max-w-6xl mx-auto pt-4">
        <RenderingIndicator type="ISR" source="CMS" />
      </div>
    </div>
  );
}
