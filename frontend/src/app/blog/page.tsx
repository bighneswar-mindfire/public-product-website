// frontend/src/app/blog/page.tsx
import { fetchFromStrapi } from "@/lib/strapi";
import { RenderingIndicator } from "@/components/RenderingIndicator";
import Link from "next/link";

export const revalidate = 60;

export interface BlogPost {
  title: string;
  slug: string;
  description: string;
  date: string;
}

export default async function BlogIndexPage() {
  const posts = await fetchFromStrapi<BlogPost[]>("blog-posts", "blogPosts");

  return (
    <div className="relative max-w-4xl mx-auto space-y-8 py-8">
      <RenderingIndicator type="ISR" source="CMS" position="absolute" />

      <div className="border-b border-slate-900 pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-100">
          Insights, Tips & Delivery Stories
        </h1>
        <p className="text-slate-400 mt-2 text-sm">
          Stay updated with the latest logistics trends, shipping guides, packaging tips, and
          courier industry insights.
        </p>
      </div>

      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="group border-b border-slate-900/60 pb-8 space-y-2">
            <span className="text-xs font-mono text-emerald-400">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <h2 className="text-2xl font-bold group-hover:text-emerald-400 transition duration-300">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">{post.description}</p>
            <Link
              href={`/blog/${post.slug}`}
              className="inline-block text-xs font-semibold text-emerald-400 hover:underline"
            >
              Read more... &rarr;
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
