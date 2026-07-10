"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center text-center py-24 space-y-6">
      <p className="text-sm font-mono text-emerald-400 tracking-wide">Something went wrong</p>
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-100">
        An unexpected error occurred
      </h1>
      <p className="text-slate-400 max-w-md text-sm leading-relaxed">
        We&apos;ve been notified and are looking into it. You can try again, or head back to the
        home page.
      </p>
      {error.digest && (
        <p className="text-[10px] font-mono text-slate-600">Error ID: {error.digest}</p>
      )}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-lg bg-emerald-500 text-slate-950 text-sm font-semibold hover:bg-emerald-400 transition duration-150"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-lg border border-slate-800 text-slate-300 text-sm font-semibold hover:border-emerald-500/30 transition duration-150"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
