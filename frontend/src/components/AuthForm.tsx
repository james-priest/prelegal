"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { MIN_PASSWORD_LENGTH, signIn, signUp } from "@/lib/auth";

const copy = {
  signin: {
    title: "Sign in",
    intro: "Welcome back. Pick up where you left off.",
    submit: "Sign in",
    pending: "Signing in…",
    switchText: "New to Prelegal?",
    switchLink: { href: "/signup/", label: "Create an account" },
  },
  signup: {
    title: "Create your account",
    intro: "Your drafts are saved to your account so you can come back to them.",
    submit: "Create account",
    pending: "Creating account…",
    switchText: "Already have an account?",
    switchLink: { href: "/", label: "Sign in" },
  },
};

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-xs focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/25";

/** Email and password form for signing in or creating an account. */
export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const text = copy[mode];
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const credentials = { email: String(form.get("email")), password: String(form.get("password")) };
    setError("");
    setPending(true);
    try {
      await (mode === "signin" ? signIn : signUp)(credentials);
      router.push("/documents/");
    } catch (e) {
      setError((e as Error).message);
      setPending(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-brand-navy">{text.title}</h1>
      <p className="mt-2 text-sm text-slate-600">{text.intro}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-800">Email</span>
          <input type="email" name="email" autoComplete="email" required className={inputClass} />
        </label>
        <div>
          <label className="block">
            <span className="text-sm font-medium text-slate-800">Password</span>
            <input
              type="password"
              name="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              minLength={MIN_PASSWORD_LENGTH}
              required
              aria-describedby={mode === "signup" ? "password-hint" : undefined}
              className={inputClass}
            />
          </label>
          {mode === "signup" && (
            <p id="password-hint" className="mt-1 text-xs text-slate-500">
              At least {MIN_PASSWORD_LENGTH} characters.
            </p>
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-brand-purple px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-purple/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {pending ? text.pending : text.submit}
        </button>
      </form>

      <p className="mt-8 text-sm text-slate-600">
        {text.switchText}{" "}
        <Link href={text.switchLink.href} className="font-semibold text-brand-blue-text hover:underline">
          {text.switchLink.label}
        </Link>
      </p>
    </div>
  );
}
