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
        setMessage(`Success! Total Waitlist count is now ${data.count}.`);
      } else {
        setStatus("error");
        setMessage(data.error || "An error occurred while joining the waitlist.");
      }
    } catch {
      setStatus("error");
      setMessage("Connection failed. Please check your network and try again.");
    }
  }

  return (
    <div className="relative w-full max-w-xl mx-auto pb-10">
      <RenderingIndicator type="CSR" source="API" position="absolute" />

      <div className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-lg backdrop-blur-sm shadow-xl">
        <h3 className="text-lg font-bold text-slate-100 mb-2">Join the Private Beta</h3>
        <p className="text-slate-400 text-sm mb-4">
          Gain early platform access, standard usage tiering, and weekly developer logs.
        </p>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            placeholder="enter-your-work-email@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
            className="bg-slate-950 border border-slate-750 text-slate-100 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 transition"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold rounded px-4 py-2 transition shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {status === "loading" ? "Joining..." : "Subscribe"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-3 text-xs font-semibold ${
              status === "success" ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
