"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col items-center justify-center bg-[#090d16] text-slate-100 px-4">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <p className="text-sm font-mono text-emerald-400 tracking-wide">Something went wrong</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-100">
            An unexpected error occurred
          </h1>
          <p className="text-slate-400 max-w-md text-sm leading-relaxed">
            The application ran into a problem it couldn&apos;t recover from. Please try again.
          </p>
          {error.digest && (
            <p className="text-[10px] font-mono text-slate-600">Error ID: {error.digest}</p>
          )}
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg bg-emerald-500 text-slate-950 text-sm font-semibold hover:bg-emerald-400 transition duration-150"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
