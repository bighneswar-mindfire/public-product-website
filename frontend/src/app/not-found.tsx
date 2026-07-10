import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 space-y-6">
      <p className="text-6xl font-extrabold tracking-tight text-emerald-400">404</p>
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-100">Page not found</h1>
      <p className="text-slate-400 max-w-md text-sm leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-lg bg-emerald-500 text-slate-950 text-sm font-semibold hover:bg-emerald-400 transition duration-150"
      >
        Back to home
      </Link>
    </div>
  );
}
