"use client";

import Link from "next/link";
import { useAuth } from "@/auth/Providers";
import { signOut } from "firebase/auth";
import { auth } from "@/auth/firebase";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const { user } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Courav
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-800 dark:text-slate-300">
            <Link
              href="/features"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              Blog
            </Link>

            {user && (
              <Link
                href="/dashboard"
                className="text-slate-800 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition font-medium"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <ThemeToggle />
          {user ? (
            <>
              <button
                onClick={handleLogout}
                className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-800 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              >
                Log In
              </Link>
              <Link
                href="/login"
                className="bg-emerald-200 dark:bg-emerald-500 text-slate-950 font-semibold px-3 py-1.5 rounded hover:bg-emerald-300 dark:hover:bg-emerald-400 transition"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
