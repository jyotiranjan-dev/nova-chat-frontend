"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthShell from "@/components/AuthShell";

const USERNAME_RE = /^[a-z0-9_]+$/;

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const usernameError = useMemo(() => {
    if (!username) return null;
    if (username.length < 3) return "Too short — at least 3 characters";
    if (username.length > 20) return "Too long — at most 20 characters";
    if (!USERNAME_RE.test(username)) return "Only lowercase letters, numbers, underscores";
    return null;
  }, [username]);

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (usernameError) return setError(usernameError);
    if (!displayName.trim()) return setError("Tell us what to call you");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords don't match");

    setSubmitting(true);
    const res = await signup(username.toLowerCase(), displayName.trim(), password);
    setSubmitting(false);

    if (res.success) {
      router.push("/chat");
    } else {
      setError(res.error);
    }
  }

  const strengthLabel = ["Weak", "Weak", "Okay", "Good", "Strong"][passwordStrength];
  const strengthColor = ["#F87171", "#F87171", "#FFB454", "#4F9CF9", "#34D399"][passwordStrength];

  return (
    <AuthShell>
      <div className="lg:hidden flex items-center gap-2.5 mb-10">
        <div className="w-8 h-8 rounded-lg bg-nova-primary flex items-center justify-center">
          <span className="text-white font-display font-bold text-sm">N</span>
        </div>
        <span className="font-display font-semibold text-lg">Nova</span>
      </div>

      <h2 className="font-display font-semibold text-2xl text-nova-text">Create your account</h2>
      <p className="mt-1.5 text-sm text-nova-textMuted">
        You&apos;ll get a unique 10-digit Nova ID — no phone number needed.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <Field label="Username" hint={usernameError} hintError>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-nova-textFaint text-sm">@</span>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))}
              placeholder="yourname"
              autoComplete="off"
              className="nova-input pl-7"
            />
          </div>
        </Field>

        <Field label="Display name">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="What should we call you?"
            autoComplete="name"
            className="nova-input"
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            className="nova-input"
          />
          {password && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1 rounded-full bg-nova-elevated overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${(passwordStrength / 4) * 100}%`, background: strengthColor }}
                />
              </div>
              <span className="text-[11px] font-medium" style={{ color: strengthColor }}>
                {strengthLabel}
              </span>
            </div>
          )}
        </Field>

        <Field label="Confirm password">
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            className="nova-input"
          />
        </Field>

        {error && (
          <p className="text-sm text-nova-danger bg-nova-danger/10 border border-nova-danger/20 rounded-nova-sm px-3 py-2.5">
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className="nova-btn-primary mt-1">
          {submitting ? "Creating your account…" : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-nova-textMuted">
        Already have an account?{" "}
        <Link href="/login" className="text-nova-primary font-medium hover:text-nova-primaryHover">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}

function Field({ label, children, hint, hintError }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-nova-textSoft">{label}</span>
      {children}
      {hint && (
        <span className={`text-[11px] ${hintError ? "text-nova-danger" : "text-nova-textFaint"}`}>{hint}</span>
      )}
    </label>
  );
}
