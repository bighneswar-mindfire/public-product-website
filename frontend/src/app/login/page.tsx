"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "@/auth/firebase";
import { useRouter, useSearchParams } from "next/navigation";

const VERIFICATION_POLL_INTERVAL_MS = 3000;

function LoginForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [resending, setResending] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  function resetMessages() {
    setError("");
    setInfo("");
  }

  const establishSession = useCallback(
    async (user: User) => {
      const idToken = await user.getIdToken(true);
      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!sessionRes.ok) {
        throw new Error("Failed to initialize secure session cookie.");
      }

      router.push(callbackUrl);
      router.refresh();
    },
    [router, callbackUrl]
  );

  useEffect(() => {
    if (!pendingUser) return;

    let cancelled = false;

    const interval = setInterval(async () => {
      try {
        await pendingUser.reload();
        if (cancelled) return;

        if (pendingUser.emailVerified) {
          clearInterval(interval);
          await establishSession(pendingUser);
        }
      } catch (err) {
        console.warn("Verification poll failed.", err);
      }
    }, VERIFICATION_POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pendingUser, establishSession]);

  async function handleResendVerification() {
    if (!pendingUser) return;
    setResending(true);
    try {
      await sendEmailVerification(pendingUser);
      setInfo("Verification email sent. Please check your inbox.");
    } catch {
      setError("Failed to resend verification email. Please try again later.");
    } finally {
      setResending(false);
    }
  }

  async function handleCancelVerification() {
    await signOut(auth);
    setPendingUser(null);
    resetMessages();
  }

  async function handleAuth(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    resetMessages();

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const currentUser = userCredential.user;

        await updateProfile(currentUser, { displayName: fullName });
        await sendEmailVerification(currentUser);

        setPassword("");
        setConfirmPassword("");
        setPendingUser(currentUser);
        setLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      if (!currentUser.emailVerified) {
        setPendingUser(currentUser);
        setLoading(false);
        return;
      }

      await establishSession(currentUser);
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

  if (pendingUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-900/40 border border-slate-800 rounded-lg space-y-6 backdrop-blur-sm shadow-xl text-center">
        <div>
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-slate-400 text-xs mt-2">
            We sent a verification link to{" "}
            <span className="text-slate-200 font-medium">{pendingUser.email}</span>. This page will
            continue automatically once it&apos;s confirmed.
          </p>
        </div>

        <div className="flex justify-center">
          <div className="h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>

        {info && (
          <div role="status" aria-live="polite" className="text-xs text-emerald-400">
            {info}
          </div>
        )}

        {error && (
          <div role="alert" aria-live="assertive" className="text-xs text-rose-400">
            {error}
          </div>
        )}

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resending}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-2 rounded text-sm transition disabled:opacity-50 cursor-pointer"
          >
            {resending ? "Sending..." : "Resend verification email"}
          </button>
          <button
            type="button"
            onClick={handleCancelVerification}
            className="text-xs text-slate-400 hover:underline cursor-pointer"
          >
            Use a different account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-slate-900/40 border border-slate-800 rounded-lg space-y-6 backdrop-blur-sm shadow-xl">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{isRegister ? "Create Account" : "Welcome Back"}</h1>
        <p className="text-slate-400 text-xs mt-1">{isRegister ? "Sign up " : "Log In."}</p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {isRegister && (
          <div>
            <label htmlFor="fullName" className="block text-xs text-slate-400 mb-1.5 font-medium">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              placeholder="Enter full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-slate-100"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-xs text-slate-400 mb-1.5 font-medium">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-slate-100"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs text-slate-400 mb-1.5 font-medium">
            Password (Min 6 chars)
          </label>
          <input
            id="password"
            type="password"
            required
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-slate-100"
          />
        </div>

        {isRegister && (
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs text-slate-400 mb-1.5 font-medium"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-emerald-500 outline-none text-slate-100"
            />
          </div>
        )}

        {info && (
          <div role="status" aria-live="polite" className="text-xs text-emerald-400">
            {info}
          </div>
        )}

        {error && (
          <div role="alert" aria-live="assertive" className="text-xs text-rose-400">
            {error}
          </div>
        )}

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
            resetMessages();
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
