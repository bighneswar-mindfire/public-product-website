"use client";

import { useState } from "react";
import { RenderingIndicator } from "./RenderingIndicator";

interface SubscribeResponse {
  success: boolean;
  count: number;
  error?: string;
}

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as SubscribeResponse;

      if (res.ok) {
        setStatus("success");
        setEmail("");
        setMessage("You have successfully subscribed to our newsletter!");
      } else {
        setStatus("error");
        setMessage(data.error || "An error occurred while subscribing.");
      }
    } catch {
      setStatus("error");
      setMessage("Connection failed. Please check your network and try again.");
    }
  }

  return (
    <div className="relative w-full max-w-xl mx-auto pb-10">
      <RenderingIndicator type="CSR" source="API" position="absolute" />

      <div className="p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-lg backdrop-blur-sm shadow-xl transition-colors duration-300">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
          Join Our Logistics Community.
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
          Be the first to hear about new services, shipping solutions and expert transportation
          advice.
        </p>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            placeholder="Subscribe now!"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            className="bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-emerald-200 dark:bg-emerald-500 hover:bg-emerald-300 dark:hover:bg-emerald-400 text-slate-950 text-sm font-semibold rounded px-4 py-2 transition shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {status === "loading" ? "Joining..." : "Subscribe"}
          </button>
        </form>

        <div
          role="status"
          aria-live="polite"
          className={`mt-3 text-xs font-semibold empty:hidden ${
            status === "success"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {message}
        </div>
      </div>
    </div>
  );
}
