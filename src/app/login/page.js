"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Enter your username and password");
      return;
    }
    setSubmitting(true);
    const res = await login(username.trim().toLowerCase(), password);
    setSubmitting(false);
    if (res.success) {
      router.push("/chat");
    } else {
      setError(res.error);
    }
  }

  return (
    <AuthShell>
      <div className="lg:hidden flex items-center gap-2.5 mb-10">
        <div className="w-8 h-8 rounded-lg bg-nova-primary flex items-center justify-center">
          <span className="text-white font-display font-bold text-sm">N</span>
        </div>
        <span className="font-display font-semibold text-lg">Nova</span>
      </div>

      <h2 className="font-display font-semibold text-2xl text-nova-text">Welcome back</h2>
      <p className="mt-1.5 text-sm text-nova-textMuted">Log in to keep the conversation going.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <Field label="Username">
          <input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            autoComplete="username"
            className="nova-input"
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="nova-input"
          />
        </Field>

        {error && (
          <p className="text-sm text-nova-danger bg-nova-danger/10 border border-nova-danger/20 rounded-nova-sm px-3 py-2.5">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="nova-btn-primary mt-1">
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-nova-textMuted">
        New to Nova?{" "}
        <Link href="/signup" className="text-nova-primary font-medium hover:text-nova-primaryHover">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-nova-textSoft">{label}</span>
      {children}
    </label>
  );
}
