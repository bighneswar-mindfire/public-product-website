import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
          >
            Public Product Website
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <Link href="/features" className="hover:text-emerald-400 transition">
              Features
            </Link>
            <Link href="/pricing" className="hover:text-emerald-400 transition">
              Pricing
            </Link>
            <Link href="/blog" className="hover:text-emerald-400 transition font-medium">
              Blog
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-slate-300 hover:text-emerald-400 transition">
            Log In
          </Link>
          <Link
            href="/login"
            className="bg-emerald-500 text-slate-950 font-semibold px-3 py-1.5 rounded hover:bg-emerald-400 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
