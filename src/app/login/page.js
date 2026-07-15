"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      const dest = params.get("from") || data.redirect || "/";
      router.push(dest);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-royal to-royal-700 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white font-serif text-lg font-bold text-royal">
            LA
          </div>
          <span className="font-serif text-xl font-bold text-white">
            London Academy Jerusalem
          </span>
        </Link>

        <form onSubmit={onSubmit} className="card">
          <h1 className="text-xl font-bold text-royal">Portal login</h1>
          <p className="mt-1 text-sm text-royal-700/60">
            Teachers and administrators only.
          </p>

          {error && (
            <div className="mt-4 rounded-lg border border-crimson/30 bg-crimson/5 px-4 py-2 text-sm text-crimson-700">
              {error}
            </div>
          )}

          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="mt-4 text-center text-sm text-royal-700/60">
            Want to teach with us?{" "}
            <Link href="/apply" className="font-semibold text-crimson hover:underline">
              Apply here
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
