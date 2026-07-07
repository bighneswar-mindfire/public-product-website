"use client";

import { useState, Suspense } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/auth/firebase";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  async function handleAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = isRegister
        ? await createUserWithEmailAndPassword(auth, email, password)
        : await signInWithEmailAndPassword(auth, email, password);

      const currentUser = userCredential.user;

      if (currentUser && currentUser.email) {
        const sessionRes = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: currentUser.email, uid: currentUser.uid }),
        });

        if (!sessionRes.ok) {
          throw new Error("Failed to initialize secure session cookie.");
        }

        router.push(callbackUrl);
        router.refresh();
      } else {
        throw new Error("Failed to retrieve authenticated user information.");
      }
    } catch (err) {
      const authError = err as { code?: string; message?: string };
      console.error(authError);
      if (authError.code === "auth/user-not-found" || authError.code === "auth/wrong-password") {
        setError("Invalid email or password. Feel free to register an account below.");
      } else if (authError.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please log in instead.");
      } else {
        setError(authError.message || "An authentication error occurred.");
      }
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-slate-900/40 border border-slate-800 rounded-lg space-y-6 backdrop-blur-sm shadow-xl">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{isRegister ? "Create Account" : "Welcome Back"}</h1>
        <p className="text-slate-400 text-xs mt-1">{isRegister ? "Sign up " : "Log In."}</p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">Email Address</label>
          <input
            type="email"
            required
            placeholder="e.g. user@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-slate-100"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">
            Password (Min 6 chars)
          </label>
          <input
            type="password"
            required
            placeholder="e.g. password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-slate-100"
          />
        </div>

        {error && <div className="text-xs text-rose-400">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2 rounded text-sm transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Processing..." : isRegister ? "Sign Up" : "Log In"}
        </button>
      </form>

      <div className="text-center pt-4 border-t border-slate-800/60">
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
          }}
          className="text-xs text-emerald-400 hover:underline cursor-pointer"
        >
          {isRegister ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto my-16 p-8 bg-slate-900/40 border border-slate-800 rounded-lg text-center text-sm text-slate-400 animate-pulse">
          Loading credentials portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
