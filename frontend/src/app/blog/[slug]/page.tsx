import { fetchFromStrapi } from "@/lib/strapi";
import { RenderingIndicator } from "@/components/RenderingIndicator";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

export interface BlogPostDetail {
  title: string;
  slug: string;
  description: string;
  date: string;
  content: string;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await fetchFromStrapi<BlogPostDetail[]>("blog-posts", "blogPosts");
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const posts = await fetchFromStrapi<BlogPostDetail[]>("blog-posts", "blogPosts");

  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-2xl mx-auto py-8 space-y-6">
      <RenderingIndicator type="ISR" source="CMS" />

      <Link href="/blog" className="text-xs font-mono text-emerald-400 hover:underline">
        &larr; Back
      </Link>

      <div className="space-y-2 pt-4">
        <span className="text-xs text-slate-500">
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-100">{post.title}</h1>
        <p className="text-base text-slate-400 italic font-light leading-relaxed">
          {post.description}
        </p>
      </div>

      <hr className="border-slate-900" />

      <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-line space-y-4">
        {post.content}
      </div>
    </article>
  );
}
