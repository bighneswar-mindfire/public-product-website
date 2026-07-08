/* eslint-disable @typescript-eslint/no-unused-vars */
import { fetchFromStrapi } from "@/lib/strapi";
import { RenderingIndicator } from "@/components/RenderingIndicator";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

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
    <article className="relative max-w-4xl mx-auto py-8 space-y-6 pt-4 pb-16">
      <Link
        href="/blog"
        className="text-sm sm:text-base font-semibold text-emerald-400 hover:text-emerald-300 transition duration-150 inline-flex items-center gap-1"
      >
        &larr; Back to articles
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

      <div className="text-slate-350 leading-relaxed text-sm sm:text-base space-y-4">
        <ReactMarkdown
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-3xl font-extrabold my-5 text-slate-100" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-2xl font-bold my-4 text-slate-200" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-xl font-semibold my-3 text-slate-250" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="leading-relaxed my-3 text-slate-300" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-extrabold text-emerald-400" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-inside my-3 space-y-1.5" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-inside my-3 space-y-1.5" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="text-slate-300 ml-2 inline-block" {...props} />
            ),
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      <div className="flex justify-end pt-6">
        <RenderingIndicator type="ISR" source="CMS" />
      </div>
    </article>
  );
}
